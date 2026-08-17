from typing import List, Dict, Any

def generate_proactive_insights(user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates structured proactive insights with evidence strength ratings (STRONG, MODERATE, LIMITED).
    """
    insights = []
    tasks = user_context.get("tasks", [])
    goals = user_context.get("goals", [])
    analytics = user_context.get("analytics", {})

    # Task Risk Pattern Insight
    high_risk_tasks = [t for t in tasks if t.get("deadlineRisk", 0) >= 0.7 and t.get("status") != "COMPLETED"]
    if high_risk_tasks:
        insights.append({
            "category": "TASK_PATTERN",
            "title": f"{len(high_risk_tasks)} high-risk deadline(s) detected",
            "description": f"Tasks like '{high_risk_tasks[0].get('title')}' show high probability of delay based on current velocity.",
            "evidenceStrength": "STRONG" if len(high_risk_tasks) >= 2 else "MODERATE",
            "suggestedAction": "Reschedule low-priority work to free focus blocks"
        })

    # Workload Anomaly Insight
    workload = analytics.get("workloadPressure", "LOW")
    if workload in ["HIGH", "OVERLOADED"]:
        insights.append({
            "category": "WORKLOAD_PATTERN",
            "title": "Daily workload exceeds historical capacity",
            "description": "Planned activities exceed your 7-day average completion hours.",
            "evidenceStrength": "STRONG",
            "suggestedAction": "Move non-essential tasks to tomorrow"
        })

    # Goal Velocity Insight
    active_goals = [g for g in goals if g.get("status") == "ACTIVE"]
    for g in active_goals:
        if g.get("progress", 0) < 30:
            insights.append({
                "category": "GOAL_PATTERN",
                "title": f"Goal '{g.get('title')}' is falling behind target pace",
                "description": f"Progress is currently {g.get('progress', 0)}%. Milestone completion velocity is lower than planned.",
                "evidenceStrength": "MODERATE",
                "suggestedAction": f"Break '{g.get('title')}' into 90-minute task blocks"
            })
            break

    return insights
