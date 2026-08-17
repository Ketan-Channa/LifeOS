from typing import Dict, Any, List
from app.agent.schemas import AgentState

def evaluate_step_execution(
    state: AgentState,
    completed_step_num: int,
    tool_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates step output, checks for overload/conflict conditions, and adapts execution state.
    """
    step_success = tool_result.get("status") != "FAILED" and tool_result.get("verified", True)

    adaptation_needed = False
    adaptation_reason = ""

    # Check for schedule overload observation
    schedule_data = state.observations.get("schedule", {})
    workload_data = state.observations.get("workload", {})

    if schedule_data.get("totalScheduledHours", 0) > 7.5 or workload_data.get("workloadPressure") == "HIGH":
        adaptation_needed = True
        adaptation_reason = "Schedule workload exceeds 7.5 hours. Re-prioritizing urgent deadlines & adding rest breaks."

    # Update completed steps
    if step_success and completed_step_num not in state.completedSteps:
        state.completedSteps.append(completed_step_num)
        if completed_step_num in state.pendingSteps:
            state.pendingSteps.remove(completed_step_num)

    return {
        "stepNumber": completed_step_num,
        "success": step_success,
        "adaptationNeeded": adaptation_needed,
        "adaptationReason": adaptation_reason,
        "nextStepNumber": completed_step_num + 1 if completed_step_num < len(state.plan) else None,
        "isObjectiveComplete": len(state.completedSteps) >= len(state.plan)
    }

def calculate_agent_quality_metrics(total_runs: int, successful_runs: int) -> Dict[str, Any]:
    """
    Calculates internal Agent Success Rate metric. Formula: successful_objectives / completed_agent_runs.
    """
    rate = round((successful_runs / total_runs * 100), 1) if total_runs > 0 else 100.0
    return {
        "totalRuns": total_runs,
        "successfulRuns": successful_runs,
        "agentSuccessRate": rate
    }
