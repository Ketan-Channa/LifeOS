from fastapi import APIRouter, HTTPException
from app.analytics.schemas import AnalyticsPayload, AnalyticsOverviewResponse, PatternInsight
from app.analytics.statistics import calculate_productivity_score, filter_tasks_by_date_range
from app.analytics.task_analysis import analyze_task_performance
from app.analytics.workload_analysis import analyze_workload
from app.analytics.goal_analysis import analyze_goals
from app.analytics.pattern_engine import detect_behavioral_patterns
from app.analytics.routine_analysis import calculate_routine_analysis
from app.analytics.correlation_analysis import calculate_habit_correlations

router = APIRouter(prefix="/analyze", tags=["analytics"])

@router.post("/overview", response_model=AnalyticsOverviewResponse)
def analyze_overview_endpoint(payload: AnalyticsPayload):
    try:
        tasks = payload.tasks
        goals = payload.goals
        date_range = payload.dateRange

        filtered_tasks = filter_tasks_by_date_range(tasks, date_range)
        prod_score = calculate_productivity_score(filtered_tasks, goals)
        task_res = analyze_task_performance(tasks, date_range)
        workload_res = analyze_workload(tasks, date_range)
        top_patterns = detect_behavioral_patterns(tasks, goals, date_range)

        if not prod_score.available and not task_res.get("available", False):
            return AnalyticsOverviewResponse(
                available=False,
                reason="Insufficient historical task activity to build productivity analytics. Complete more tasks to unlock.",
                productivityScore=prod_score,
                topPatterns=[]
            )

        return AnalyticsOverviewResponse(
            available=True,
            productivityScore=prod_score,
            taskCompletionRate=task_res.get("completionRate", 0.0),
            onTimeCompletionRate=task_res.get("onTimeRate", 0.0),
            averageEstimationErrorPercentage=task_res.get("estimationErrorPercentage", 0.0),
            averageDelayMinutes=task_res.get("averageDelayMinutes", 0.0),
            postponementRatePercentage=task_res.get("postponementRatePercentage", 0.0),
            workloadPressure=workload_res.get("workloadPressure", "LOW"),
            topPatterns=top_patterns
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/productivity")
def analyze_productivity_endpoint(payload: AnalyticsPayload):
    try:
        tasks = filter_tasks_by_date_range(payload.tasks, payload.dateRange)
        prod_score = calculate_productivity_score(tasks, payload.goals)
        return prod_score.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks")
def analyze_tasks_endpoint(payload: AnalyticsPayload):
    try:
        return analyze_task_performance(payload.tasks, payload.dateRange)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workload")
def analyze_workload_endpoint(payload: AnalyticsPayload):
    try:
        return analyze_workload(payload.tasks, payload.dateRange)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/goals")
def analyze_goals_endpoint(payload: AnalyticsPayload):
    try:
        return analyze_goals(payload.goals)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patterns")
def analyze_patterns_endpoint(payload: AnalyticsPayload):
    try:
        patterns = detect_behavioral_patterns(payload.tasks, payload.goals, payload.dateRange)
        return {"available": len(patterns) > 0, "patterns": [p.model_dump() for p in patterns]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/routines")
def analyze_routines_endpoint(payload: dict):
    try:
        habits = payload.get("habits", [])
        logs = payload.get("habitLogs", [])
        return calculate_routine_analysis(habits, logs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/habit-correlations")
def analyze_habit_correlations_endpoint(payload: dict):
    try:
        habits = payload.get("habits", [])
        logs = payload.get("habitLogs", [])
        tasks = payload.get("tasks", [])
        return calculate_habit_correlations(habits, logs, tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
