from typing import Dict, Any

TOOL_RISK_LEVELS = {
    # READ Tools
    "getTasks": "READ_ONLY",
    "getTask": "READ_ONLY",
    "getTaskStats": "READ_ONLY",
    "getTaskRisk": "READ_ONLY",
    "getGoals": "READ_ONLY",
    "getGoalRisk": "READ_ONLY",
    "getSchedule": "READ_ONLY",
    "getTodaySchedule": "READ_ONLY",
    "getHabits": "READ_ONLY",
    "getHabitStats": "READ_ONLY",
    "getAnalytics": "READ_ONLY",
    "getBehaviorPatterns": "READ_ONLY",
    "getProductivityForecast": "READ_ONLY",
    "getWorkloadRisk": "READ_ONLY",
    "planDay": "READ_ONLY",
    "searchKnowledge": "READ_ONLY",
    "getDocument": "READ_ONLY",
    "getCurrentTime": "READ_ONLY",
    "getDailyBriefing": "READ_ONLY",
    "getWeeklyReview": "READ_ONLY",
    "generateDailyPlan": "READ_ONLY",
    "comparePlans": "READ_ONLY",
    "generatePlanPDF": "READ_ONLY",
    "analyzeGoal": "READ_ONLY",
    "analyzeProductivity": "READ_ONLY",
    "analyzeBehavior": "READ_ONLY",

    # WRITE Tools
    "createTask": "LOW_RISK_WRITE",
    "createTasksFromRecommendation": "LOW_RISK_WRITE",
    "updateTask": "MEDIUM_RISK_WRITE",
    "completeTask": "LOW_RISK_WRITE",
    "postponeTask": "MEDIUM_RISK_WRITE",
    "createScheduleEvent": "MEDIUM_RISK_WRITE",
    "updateScheduleEvent": "MEDIUM_RISK_WRITE",
    "applyPlan": "MEDIUM_RISK_WRITE",
    "optimizeSchedule": "MEDIUM_RISK_WRITE",
    "createGoal": "HIGH_RISK_WRITE",

    # DESTRUCTIVE Operations (Always Confirmation Required)
    "deleteTask": "DESTRUCTIVE",
    "deleteGoal": "DESTRUCTIVE",
    "deleteDocument": "DESTRUCTIVE"
}

def is_tool_allowed(tool_name: str, autonomy_level: str = "AUTONOMY_2") -> bool:
    """
    Checks if a tool is permitted under the active user autonomy level.
    For Phase 11, write tools under AUTONOMY_2 / AUTONOMY_3 require user confirmation unless explicitly pre-approved.
    """
    risk = TOOL_RISK_LEVELS.get(tool_name, "READ_ONLY")

    if autonomy_level == "AUTONOMY_0":
        return risk == "READ_ONLY"

    if autonomy_level == "AUTONOMY_1":
        return risk == "READ_ONLY"

    if autonomy_level in ["AUTONOMY_2", "AUTONOMY_3", "AUTONOMY_4"]:
        return risk != "DESTRUCTIVE"

    return True

def tool_requires_user_approval(tool_name: str, autonomy_level: str = "AUTONOMY_2") -> bool:
    """
    Determines if explicit UI confirmation card is required before tool execution.
    """
    risk = TOOL_RISK_LEVELS.get(tool_name, "READ_ONLY")
    if risk == "READ_ONLY":
        return False
    
    if autonomy_level == "AUTONOMY_3" and risk == "LOW_RISK_WRITE":
        return False  # Pre-approved low-risk write

    return True  # Medium, High risk or DESTRUCTIVE write requires user confirmation
