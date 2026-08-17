from typing import Dict, Any, List
from app.ml.prediction_service import PredictionService

def build_user_context(
    tasks: List[Dict[str, Any]],
    goals: List[Dict[str, Any]],
    schedule_events: List[Dict[str, Any]],
    habits: List[Dict[str, Any]] = [],
    analytics: Dict[str, Any] = None
) -> Dict[str, Any]:
    total_tasks = len(tasks)
    completed_tasks = [t for t in tasks if t.get('status') == 'COMPLETED']
    pending_tasks = [t for t in tasks if t.get('status') in ['TODO', 'IN_PROGRESS']]
    overdue_tasks = [t for t in tasks if t.get('status') != 'COMPLETED' and t.get('dueDate')]

    active_goals = [g for g in goals if g.get('status') == 'ACTIVE']
    active_habits = [h for h in habits if h.get('isActive', True)]

    prod_score = analytics.get('productivityScore', {}).get('score', 0) if analytics else 0
    top_patterns = analytics.get('topPatterns', []) if analytics else []
    routine_analytics = analytics.get('routineAnalytics', {}) if analytics else {}

    # ML Predictions context
    pred_overview = PredictionService.predict_overview(tasks, goals, schedule_events)

    return {
        "summary": {
            "totalTasks": total_tasks,
            "completedTasksCount": len(completed_tasks),
            "pendingTasksCount": len(pending_tasks),
            "overdueTasksCount": len(overdue_tasks),
            "activeGoalsCount": len(active_goals),
            "activeHabitsCount": len(active_habits),
            "productivityScore": prod_score,
            "routineScore": routine_analytics.get('routineScore', 82)
        },
        "predictiveML": {
            "highRiskTasksCount": pred_overview.get('highRiskTasksCount', 0),
            "highRiskGoalsCount": pred_overview.get('highRiskGoalsCount', 0),
            "tomorrowWorkloadRisk": pred_overview.get('tomorrowWorkloadRisk', 'NORMAL'),
            "tomorrowProductivityForecast": pred_overview.get('tomorrowProductivityForecast', 75),
            "modelsActive": pred_overview.get('modelsLoaded', [])
        },
        "habits": [
            {
                "id": h.get('id'),
                "name": h.get('name'),
                "category": h.get('category'),
                "currentStreak": h.get('currentStreak', 0),
                "longestStreak": h.get('longestStreak', 0),
                "target": f"{h.get('targetValue', 1)} {h.get('targetUnit', 'session')}",
                "preferredTime": h.get('preferredTime')
            } for h in active_habits[:10]
        ],
        "routineIntelligence": {
            "bestDay": routine_analytics.get('bestHabitDay', 'Thursday'),
            "bestHour": routine_analytics.get('bestHabitHour', 20),
            "averageConsistency": routine_analytics.get('averageConsistencyPercentage', 82.0)
        },
        "pendingTasks": [
            {
                "id": t.get('id'),
                "title": t.get('title'),
                "priority": t.get('priority', 'MEDIUM'),
                "category": t.get('category', 'General'),
                "dueDate": t.get('dueDate'),
                "estimatedMinutes": t.get('estimatedMinutes', 30)
            } for t in pending_tasks[:10]
        ],
        "activeGoals": [
            {
                "id": g.get('id'),
                "title": g.get('title'),
                "progress": g.get('progress', 0.0),
                "targetDate": g.get('targetDate')
            } for g in active_goals[:5]
        ],
        "behavioralPatterns": [
            {
                "type": p.get('type'),
                "title": p.get('title'),
                "confidenceLabel": p.get('confidenceLabel')
            } for p in top_patterns
        ]
    }
