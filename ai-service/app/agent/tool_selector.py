from typing import List, Dict, Any
from app.scout.tool_registry import SCOUT_TOOL_REGISTRY
from app.agent.permissions import TOOL_RISK_LEVELS

# Extended Phase 11 Tool Specifications
AGENT_EXTENDED_TOOLS: Dict[str, Dict[str, Any]] = {
    **SCOUT_TOOL_REGISTRY,
    "getCurrentTime": {
        "name": "getCurrentTime",
        "description": "Returns current server time and formatted user date/day.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getDailyBriefing": {
        "name": "getDailyBriefing",
        "description": "Retrieves today's SCOUT daily briefing overview and telemetry metrics.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getWeeklyReview": {
        "name": "getWeeklyReview",
        "description": "Retrieves 7-day weekly life intelligence review and trends.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "generateDailyPlan": {
        "name": "generateDailyPlan",
        "description": "Invokes AI Plan My Day 2.0 multi-plan generator.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "comparePlans": {
        "name": "comparePlans",
        "description": "Compares scores and constraint trade-offs of candidate daily plans.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "applyPlan": {
        "name": "applyPlan",
        "description": "Applies a selected daily plan schedule to the database.",
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "generatePlanPDF": {
        "name": "generatePlanPDF",
        "description": "Renders downloadable PDF export of daily plan.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "analyzeGoal": {
        "name": "analyzeGoal",
        "description": "Calculates goal velocity, target gap, and milestone risk.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "analyzeProductivity": {
        "name": "analyzeProductivity",
        "description": "Analyzes focus duration, estimation errors, and delay causes.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "analyzeBehavior": {
        "name": "analyzeBehavior",
        "description": "Retrieves peak productive hours and habit completion correlations.",
        "permission": "READ",
        "requiresConfirmation": False
    },
    "createTasksFromRecommendation": {
        "name": "createTasksFromRecommendation",
        "description": "Drafts structured task recommendations for user approval.",
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "optimizeSchedule": {
        "name": "optimizeSchedule",
        "description": "Reschedules flexible tasks to reduce workload overload.",
        "permission": "WRITE",
        "requiresConfirmation": True
    }
}

def select_tools_for_objective(objective: str, intent: str) -> List[str]:
    """
    Intelligently selects minimal, relevant tools based on user objective and intent.
    Prevents unnecessary tool execution.
    """
    obj_lower = objective.lower()

    if intent == "PLANNER_QUERY" or "plan my day" in obj_lower or "optimize" in obj_lower:
        return ["getTodaySchedule", "getTasks", "getGoals", "getWorkloadRisk", "getTaskRisk", "generateDailyPlan", "applyPlan"]

    if "placement" in obj_lower or "interview" in obj_lower or "resume" in obj_lower:
        return ["getGoals", "getTasks", "searchKnowledge", "analyzeGoal", "createTasksFromRecommendation"]

    if intent == "TASK_QUERY" or "what should i work on" in obj_lower or "priority" in obj_lower:
        return ["getTasks", "getTodaySchedule", "getTaskRisk", "getGoals"]

    if intent == "GOAL_QUERY" or "goal" in obj_lower:
        return ["getGoals", "getGoalRisk", "analyzeGoal"]

    if intent == "HABIT_QUERY" or "habit" in obj_lower:
        return ["getHabits", "getHabitStats", "analyzeBehavior"]

    if intent == "ANALYTICS_QUERY" or "review" in obj_lower:
        return ["getAnalytics", "getWeeklyReview", "analyzeProductivity"]

    if intent == "KNOWLEDGE_QUERY" or "document" in obj_lower or "pdf" in obj_lower:
        return ["searchKnowledge", "getDocument"]

    # Fallback balanced set
    return ["getTodaySchedule", "getTasks", "getGoals", "getTaskRisk"]
