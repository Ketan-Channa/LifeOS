from typing import List, Dict, Any
from app.agent.schemas import AgentStepSpec
from app.agent.permissions import tool_requires_user_approval

def generate_agent_plan(
    objective: str,
    intent: str,
    selected_tools: List[str],
    user_constraints: List[Dict[str, Any]] = [],
    autonomy_level: str = "AUTONOMY_2"
) -> List[AgentStepSpec]:
    """
    Generates a structured, multi-step execution plan mapping subgoals to tool calls and approval requirements.
    """
    steps = []
    step_num = 1

    # Step 1: Environment Observation
    steps.append(AgentStepSpec(
        stepNumber=step_num,
        stepType="OBSERVE",
        description="Inspect schedule, pending tasks, goals, and ML workload predictions.",
        toolName="getTodaySchedule",
        status="PENDING",
        requiresApproval=False
    ))
    step_num += 1

    # Step 2: Risk & Telemetry Analysis
    steps.append(AgentStepSpec(
        stepNumber=step_num,
        stepType="PLAN",
        description="Evaluate task deadline failure risks and workload capacity constraints.",
        toolName="getTaskRisk",
        status="PENDING",
        requiresApproval=False
    ))
    step_num += 1

    # Step 3: RAG Retrieval if applicable
    if "searchKnowledge" in selected_tools:
        steps.append(AgentStepSpec(
            stepNumber=step_num,
            stepType="TOOL_CALL",
            description="Search RAG personal knowledge base documents for relevant skills/notes.",
            toolName="searchKnowledge",
            status="PENDING",
            requiresApproval=False
        ))
        step_num += 1

    # Step 4: Multi-Plan Generation / Recommendation Formulation
    if "generateDailyPlan" in selected_tools or "plan" in objective.lower() or "optimize" in objective.lower():
        steps.append(AgentStepSpec(
            stepNumber=step_num,
            stepType="TOOL_CALL",
            description="Generate candidate daily schedules using AI Daily Planner 2.0.",
            toolName="generateDailyPlan",
            status="PENDING",
            requiresApproval=False
        ))
        step_num += 1

    # Step 5: User Approval Requirement for Write Actions
    if "applyPlan" in selected_tools or "createTask" in selected_tools or "apply" in objective.lower():
        requires_app = tool_requires_user_approval("applyPlan", autonomy_level)
        steps.append(AgentStepSpec(
            stepNumber=step_num,
            stepType="USER_APPROVAL",
            description="Present recommended plan and await explicit user approval.",
            toolName="applyPlan",
            status="PENDING",
            requiresApproval=requires_app
        ))
        step_num += 1

    # Step 6: Action Execution & Revalidation
    steps.append(AgentStepSpec(
        stepNumber=step_num,
        stepType="TOOL_CALL",
        description="Execute approved schedule changes and revalidate zero schedule conflicts.",
        toolName="applyPlan" if "applyPlan" in selected_tools else "createTask",
        status="PENDING",
        requiresApproval=False
    ))
    step_num += 1

    # Step 7: Post-Action Verification & PDF Export
    steps.append(AgentStepSpec(
        stepNumber=step_num,
        stepType="EVALUATION",
        description="Verify applied schedule in database and render downloadable PDF report.",
        toolName="generatePlanPDF",
        status="PENDING",
        requiresApproval=False
    ))

    return steps
