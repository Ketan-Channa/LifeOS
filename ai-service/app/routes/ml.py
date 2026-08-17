from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from app.ml.schemas import (
    TaskRiskRequest, TaskRiskResponse,
    GoalRiskRequest, GoalRiskResponse,
    ProductivityForecastResponse, WorkloadRiskResponse,
    PredictionsOverviewResponse
)
from app.ml.prediction_service import PredictionService
from app.ml.training import train_all_models
from app.ml.model_registry import ModelRegistry

router = APIRouter(prefix="/ml", tags=["machine_learning"])

@router.get("/health")
def ml_health_endpoint():
    models = ModelRegistry.list_models()
    return {
        "status": "healthy",
        "engine": "Scikit-Learn Machine Learning Engine",
        "activeModels": list(models.keys())
    }

@router.get("/models")
def get_model_registry_endpoint():
    return ModelRegistry.list_models()

@router.post("/train/all")
def train_models_endpoint(payload: Dict[str, Any]):
    try:
        tasks = payload.get("tasks", [])
        goals = payload.get("goals", [])
        habits = payload.get("habits", [])
        habit_logs = payload.get("habitLogs", [])
        return train_all_models(tasks, goals, habits, habit_logs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/task-risk", response_model=TaskRiskResponse)
def predict_task_risk_endpoint(payload: Dict[str, Any]):
    try:
        task = payload.get("task", payload)
        user_tasks = payload.get("userTasks", [])
        return PredictionService.predict_task_risk(task, user_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/goal-risk", response_model=GoalRiskResponse)
def predict_goal_risk_endpoint(payload: Dict[str, Any]):
    try:
        goal = payload.get("goal", payload)
        linked_tasks = payload.get("linkedTasks", [])
        return PredictionService.predict_goal_risk(goal, linked_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/productivity", response_model=ProductivityForecastResponse)
def predict_productivity_endpoint(payload: Dict[str, Any]):
    try:
        score = payload.get("currentScore", 78)
        return PredictionService.predict_productivity_forecast(score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/workload", response_model=WorkloadRiskResponse)
def predict_workload_endpoint(payload: Dict[str, Any]):
    try:
        scheduled = float(payload.get("scheduledHours", 5.5))
        capacity = float(payload.get("capacityHours", 6.0))
        return PredictionService.predict_workload_risk(scheduled, capacity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/overview", response_model=PredictionsOverviewResponse)
def predict_overview_endpoint(payload: Dict[str, Any]):
    try:
        tasks = payload.get("tasks", [])
        goals = payload.get("goals", [])
        schedule = payload.get("scheduleEvents", [])
        return PredictionService.predict_overview(tasks, goals, schedule)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
