from typing import Dict, Any, List
from app.scout.schemas import ToolCallSpec

SCOUT_TOOL_REGISTRY: Dict[str, Dict[str, Any]] = {
    # --- READ TOOLS (Automatic Execution) ---
    "getTasks": {
        "name": "getTasks",
        "description": "Retrieves pending, in-progress, or overdue tasks for the user.",
        "inputSchema": {"status": "string (optional)", "priority": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getTask": {
        "name": "getTask",
        "description": "Retrieves details of a specific task by ID or title match.",
        "inputSchema": {"taskId": "string"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getTaskStats": {
        "name": "getTaskStats",
        "description": "Calculates task completion rate, postponed counts, and estimation errors.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getTaskRisk": {
        "name": "getTaskRisk",
        "description": "Uses Phase 8 Machine Learning to calculate deadline failure risk for active tasks.",
        "inputSchema": {"taskId": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getGoals": {
        "name": "getGoals",
        "description": "Retrieves active goals, progress velocity, and linked milestones.",
        "inputSchema": {"status": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getGoalRisk": {
        "name": "getGoalRisk",
        "description": "Calculates goal completion risk based on target date and milestone progress velocity.",
        "inputSchema": {"goalId": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getSchedule": {
        "name": "getSchedule",
        "description": "Retrieves scheduled events and time blocks for a specific date range.",
        "inputSchema": {"startDate": "string", "endDate": "string"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getTodaySchedule": {
        "name": "getTodaySchedule",
        "description": "Retrieves today's scheduled blocks, fixed events, and available free windows.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getHabits": {
        "name": "getHabits",
        "description": "Retrieves active habit trackers, current completion streaks, and target frequencies.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getHabitStats": {
        "name": "getHabitStats",
        "description": "Retrieves habit consistency rates, routine scores, and peak completion periods.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getAnalytics": {
        "name": "getAnalytics",
        "description": "Retrieves productivity scores, focus duration totals, and statistical telemetry.",
        "inputSchema": {"timeframe": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getBehaviorPatterns": {
        "name": "getBehaviorPatterns",
        "description": "Retrieves peak completion hours, habit-productivity correlations, and delay patterns.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getProductivityForecast": {
        "name": "getProductivityForecast",
        "description": "Generates 7-day productivity score forecast using ML regression models.",
        "inputSchema": {},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getWorkloadRisk": {
        "name": "getWorkloadRisk",
        "description": "Evaluates planned workload capacity vs historical completion capacity to detect burn-out risk.",
        "inputSchema": {"date": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "planDay": {
        "name": "planDay",
        "description": "Invokes AI Plan My Day 2.0 to generate candidate daily schedules (Balanced, Deadline First, Focus, Low Stress).",
        "inputSchema": {"date": "string", "preferredStartTime": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "searchKnowledge": {
        "name": "searchKnowledge",
        "description": "Performs top-K semantic vector search over the user's RAG knowledge base documents.",
        "inputSchema": {"queryText": "string", "category": "string (optional)"},
        "permission": "READ",
        "requiresConfirmation": False
    },
    "getDocument": {
        "name": "getDocument",
        "description": "Retrieves document metadata, page count, and extracted RAG chunks.",
        "inputSchema": {"documentId": "string"},
        "permission": "READ",
        "requiresConfirmation": False
    },

    # --- WRITE TOOLS (Requires Explicit Confirmation) ---
    "createTask": {
        "name": "createTask",
        "description": "Creates a new task in LifeOS.",
        "inputSchema": {"title": "string", "dueDate": "string (optional)", "priority": "string", "estimatedDuration": "number"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "updateTask": {
        "name": "updateTask",
        "description": "Updates an existing task's parameters.",
        "inputSchema": {"taskId": "string", "title": "string (optional)", "priority": "string (optional)", "dueDate": "string (optional)"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "completeTask": {
        "name": "completeTask",
        "description": "Marks a task as COMPLETED.",
        "inputSchema": {"taskId": "string"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "postponeTask": {
        "name": "postponeTask",
        "description": "Moves a task's target due date to a future date.",
        "inputSchema": {"taskId": "string", "newDueDate": "string", "reason": "string"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "createScheduleEvent": {
        "name": "createScheduleEvent",
        "description": "Adds a fixed event or time block to the user's schedule.",
        "inputSchema": {"title": "string", "startTime": "string", "endTime": "string", "date": "string"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "updateScheduleEvent": {
        "name": "updateScheduleEvent",
        "description": "Modifies start or end time of a scheduled event.",
        "inputSchema": {"eventId": "string", "startTime": "string", "endTime": "string"},
        "permission": "WRITE",
        "requiresConfirmation": True
    },
    "createGoal": {
        "name": "createGoal",
        "description": "Creates a new strategic goal with target date and target progress.",
        "inputSchema": {"title": "string", "category": "string", "targetDate": "string"},
        "permission": "WRITE",
        "requiresConfirmation": True
    }
}

def get_tool_spec(tool_name: str) -> ToolCallSpec:
    spec = SCOUT_TOOL_REGISTRY.get(tool_name)
    if not spec:
        return ToolCallSpec(name=tool_name, permission="READ", requiresConfirmation=False)
    return ToolCallSpec(
        name=spec["name"],
        inputData=spec["inputSchema"],
        permission=spec["permission"],
        requiresConfirmation=spec["requiresConfirmation"]
    )
