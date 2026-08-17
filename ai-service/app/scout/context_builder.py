from datetime import datetime
from typing import Dict, Any, List

def build_scout_context(
    prompt: str,
    intent: str,
    user_context: Dict[str, Any],
    timezone: str = "Asia/Kolkata",
    history: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    """
    Assembles bounded SCOUT context adhering to a strict context budget.
    Ensures current time awareness and bounded conversation history.
    """
    now = datetime.now()
    current_time_str = now.strftime("%Y-%m-%d %I:%M %p (%A)")

    tasks = user_context.get("tasks", [])
    goals = user_context.get("goals", [])
    schedule = user_context.get("scheduleEvents", [])
    habits = user_context.get("habits", [])
    analytics = user_context.get("analytics", {})
    ml_predictions = user_context.get("mlPredictions", {})

    # Bounded conversation history (last 4 messages)
    bounded_history = history[-4:] if history else []

    # High-risk & Urgent Filtering for Context Budget
    urgent_tasks = [
        t for t in tasks
        if t.get("status") != "COMPLETED" and (t.get("priority") in ["HIGH", "URGENT"] or t.get("deadlineRisk", 0) > 0.5)
    ][:5]

    active_goals = [g for g in goals if g.get("status") == "ACTIVE"][:4]

    today_events = [e for e in schedule if e.get("date") == now.strftime("%Y-%m-%d") or "today" in str(e.get("startTime", "")).lower()][:5]

    return {
        "currentTime": current_time_str,
        "timezone": timezone,
        "intent": intent,
        "recentMessages": bounded_history,
        "tasksSummary": {
            "totalPending": len([t for t in tasks if t.get("status") != "COMPLETED"]),
            "overdueCount": len([t for t in tasks if t.get("status") != "COMPLETED" and t.get("dueDate")]),
            "highPriorityUrgentTasks": urgent_tasks
        },
        "goalsSummary": active_goals,
        "todaySchedule": today_events,
        "habitsSummary": habits[:4],
        "analyticsSummary": {
            "productivityScore": analytics.get("productivityScore", 78),
            "workloadPressure": analytics.get("workloadPressure", "LOW"),
            "estimationErrorPct": analytics.get("averageEstimationErrorPercentage", 0.0)
        },
        "mlPredictions": ml_predictions
    }
