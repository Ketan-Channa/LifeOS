from datetime import datetime
from typing import Dict, Any, List

def observe_environment(
    objective: str,
    selected_tools: List[str],
    user_context: Dict[str, Any],
    timezone: str = "Asia/Kolkata"
) -> Dict[str, Any]:
    """
    Task-specific environment observer. Retrieves observable state directly relevant to the user objective.
    """
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    tasks = user_context.get("tasks", [])
    goals = user_context.get("goals", [])
    schedule = user_context.get("scheduleEvents", [])
    habits = user_context.get("habits", [])
    analytics = user_context.get("analytics", {})
    ml_predictions = user_context.get("mlPredictions", {})

    observations: Dict[str, Any] = {
        "currentTime": now.strftime("%Y-%m-%d %I:%M %p (%A)"),
        "timezone": timezone
    }

    if "getTodaySchedule" in selected_tools or "getSchedule" in selected_tools:
        today_events = [e for e in schedule if e.get("date") == today_str or "today" in str(e.get("startTime", "")).lower()]
        total_hours = sum(e.get("duration", 60) for e in today_events) / 60.0 if today_events else 0.0
        observations["schedule"] = {
            "date": today_str,
            "eventsCount": len(today_events),
            "totalScheduledHours": round(total_hours, 1),
            "events": today_events[:5]
        }

    if "getTasks" in selected_tools or "getTaskRisk" in selected_tools:
        pending = [t for t in tasks if t.get("status") != "COMPLETED"]
        high_risk = [t for t in pending if t.get("deadlineRisk", 0) >= 0.6 or t.get("priority") in ["HIGH", "URGENT"]]
        observations["tasks"] = {
            "pendingCount": len(pending),
            "highPriorityRiskCount": len(high_risk),
            "highRiskTasks": high_risk[:4]
        }

    if "getGoals" in selected_tools or "analyzeGoal" in selected_tools:
        active_goals = [g for g in goals if g.get("status") == "ACTIVE"]
        observations["goals"] = [
            {"id": g.get("id"), "title": g.get("title"), "progress": g.get("progress", 0), "category": g.get("category")}
            for g in active_goals[:4]
        ]

    if "getHabits" in selected_tools:
        observations["habits"] = [
            {"id": h.get("id"), "name": h.get("name"), "currentStreak": h.get("currentStreak", 0)}
            for h in habits[:4]
        ]

    if "getWorkloadRisk" in selected_tools or "getAnalytics" in selected_tools:
        observations["workload"] = {
            "productivityScore": analytics.get("productivityScore", 82),
            "workloadPressure": analytics.get("workloadPressure", "MEDIUM"),
            "mlPrediction": ml_predictions.get("workloadRisk", "BALANCED")
        }

    return observations
