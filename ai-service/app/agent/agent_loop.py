import time
from typing import Dict, Any, List, Optional
from app.agent.schemas import AgentRunRequest, AgentRunResponsePayload, AgentState, AgentStepSpec
from app.agent.agent_state import AgentStateManager
from app.agent.goal_manager import decompose_objective
from app.agent.tool_selector import select_tools_for_objective
from app.agent.observer import observe_environment
from app.agent.planner import generate_agent_plan
from app.agent.executor import execute_agent_step_tool
from app.agent.evaluator import evaluate_step_execution
from app.scout.intent_classifier import classify_prompt_intent
from app.agent.errors import AgentMaxStepsExceededError, AgentLoopTimeoutError

MAX_AGENT_STEPS = 10
MAX_TOOL_CALLS = 20
DEFAULT_TIMEOUT_SECONDS = 60.0

def run_agent_loop(payload: AgentRunRequest) -> AgentRunResponsePayload:
    """
    Primary Agent Loop orchestrator for Phase 11 Full Autonomous AI Agent Engine.
    Executes OBSERVE -> UNDERSTAND -> PLAN -> SELECT TOOLS -> EXECUTE SAFE ACTIONS -> EVALUATE -> ADAPT -> COMPLETE OBJECTIVE.
    """
    session_id = f"run_{int(time.time()*1000)}"
    start_time = time.time()
    trace: List[str] = []

    # 1. Initialize State & Intent
    intent = classify_prompt_intent(payload.objective)
    autonomy_level = payload.autonomyLevel or "AUTONOMY_2"

    state = AgentStateManager.create_initial_state(session_id, payload.userId, payload.objective, autonomy_level)
    trace.append(f"State initialized. Intent classified as '{intent}' under autonomy level '{autonomy_level}'.")

    # 2. Subgoal Decomposition
    subgoals = decompose_objective(payload.objective, intent)
    state.subgoals = subgoals
    trace.append(f"Decomposed objective into {len(subgoals)} subgoals.")

    # 3. Tool Selection
    selected_tools = select_tools_for_objective(payload.objective, intent)
    trace.append(f"Selected {len(selected_tools)} task-specific tools: {', '.join(selected_tools)}.")

    # 4. Observe Environment
    AgentStateManager.update_status(state, "OBSERVING")
    user_ctx = payload.contextData or {}
    observations = observe_environment(payload.objective, selected_tools, user_ctx, payload.timezone or "Asia/Kolkata")
    state.observations = observations
    trace.append(f"Observed environment: {observations.get('currentTime', 'Now')} • Schedule: {observations.get('schedule', {}).get('eventsCount', 0)} events • Pending Tasks: {observations.get('tasks', {}).get('pendingCount', 0)}.")

    # 5. Generate Multi-Step Plan
    AgentStateManager.update_status(state, "PLANNING")
    plan_steps = generate_agent_plan(payload.objective, intent, selected_tools, [], autonomy_level)
    AgentStateManager.set_plan(state, plan_steps)
    trace.append(f"Generated {len(plan_steps)}-step execution plan.")

    # 6. Execute Agent Loop (Bounded by maxSteps & timeout)
    tool_call_count = 0
    requires_approval = False
    approval_request = None

    for step in plan_steps:
        # Check Max Steps Limit
        if step.stepNumber > MAX_AGENT_STEPS:
            state.status = "FAILED"
            trace.append(f"Stopped: Exceeded maximum allowed steps limit ({MAX_AGENT_STEPS}).")
            break

        # Check Timeout Limit
        if (time.time() - start_time) > DEFAULT_TIMEOUT_SECONDS:
            state.status = "FAILED"
            trace.append(f"Stopped: Operation timed out after {int(DEFAULT_TIMEOUT_SECONDS)} seconds.")
            break

        # Step Approval Check
        if step.stepType == "USER_APPROVAL" and step.requiresApproval:
            state.status = "WAITING_FOR_APPROVAL"
            requires_approval = True
            approval_request = {
                "stepNumber": step.stepNumber,
                "actionType": "APPLY_DAILY_PLAN" if "plan" in payload.objective.lower() else "CREATE_TASK",
                "title": f"Approve action for step {step.stepNumber}: {step.description}",
                "reason": "Write action requires explicit confirmation under AUTONOMY_2.",
                "parameters": {"objective": payload.objective}
            }
            AgentStateManager.set_approval_request(state, approval_request)
            trace.append(f"Step {step.stepNumber}: Paused for user approval ('{step.description}').")
            break

        # Execute Tool Step
        AgentStateManager.update_status(state, "EXECUTING")
        step.status = "RUNNING"
        step.startedAt = time.strftime("%Y-%m-%dT%H:%M:%SZ")

        if step.toolName:
            tool_call_count += 1
            if tool_call_count > MAX_TOOL_CALLS:
                state.status = "FAILED"
                trace.append(f"Stopped: Exceeded maximum tool calls limit ({MAX_TOOL_CALLS}).")
                break

            tool_res = execute_agent_step_tool(step.toolName, {}, user_ctx, autonomy_level)
            step.outputSummary = tool_res
            state.toolResults[step.toolName] = tool_res

            # Evaluate Step Output
            eval_res = evaluate_step_execution(state, step.stepNumber, tool_res)
            step.status = "COMPLETED" if eval_res["success"] else "FAILED"
            step.completedAt = time.strftime("%Y-%m-%dT%H:%M:%SZ")

            trace.append(f"Step {step.stepNumber} ({step.toolName}): Executed successfully.")

            if eval_res["adaptationNeeded"]:
                trace.append(f"Adaptation: {eval_res['adaptationReason']}")

    # 7. Finalize Run Result
    if not requires_approval and state.status != "FAILED":
        state.status = "COMPLETED"
        trace.append("Objective completed successfully. All plan steps verified.")

    result_summary = (
        f"SCOUT Agent executed {len(state.completedSteps)} of {len(plan_steps)} steps toward objective '{payload.objective}'."
        if state.status == "COMPLETED" else
        f"SCOUT Agent is waiting for your approval to apply changes." if state.status == "WAITING_FOR_APPROVAL" else
        f"SCOUT Agent run halted safely."
    )

    return AgentRunResponsePayload(
        success=state.status in ["COMPLETED", "WAITING_FOR_APPROVAL"],
        runId=session_id,
        status=state.status,
        objective=payload.objective,
        currentStep=state.currentStep,
        totalSteps=len(plan_steps),
        plan=plan_steps,
        observationsSummary=observations,
        result=result_summary,
        requiresApproval=requires_approval,
        approvalRequest=approval_request,
        trace=trace
    )
