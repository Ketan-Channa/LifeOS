from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.ai.schemas import (
    ChatRequest, 
    RecommendationRequest, 
    RecommendationResponse, 
    RecommendationItem, 
    DailyPlanRequest, 
    DailyPlanResponse, 
    AIPlanItemSchema, 
    ExplainRequest
)
from app.ai.context_builder import build_user_context
from app.ai.gemini_service import generate_scout_chat, call_gemini_api
from app.ai.daily_planner import generate_smart_daily_plan

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/health")
def ai_health_check():
    return {
        "status": "healthy",
        "service": "LifeOS AI Intelligence Layer",
        "geminiConfigured": True,
        "version": "1.0.0"
    }

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):
    try:
        context = build_user_context(
            payload.tasks or [],
            payload.goals or [],
            payload.scheduleEvents or [],
            payload.analytics or {}
        )
        response_text = generate_scout_chat(payload.message, context)
        return {
            "success": True,
            "response": response_text,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations", response_model=RecommendationResponse)
def recommendations_endpoint(payload: RecommendationRequest):
    try:
        tasks = payload.tasks or []
        goals = payload.goals or []
        analytics = payload.analytics or {}

        recs: List[RecommendationItem] = []

        # 1. TIME_OPTIMIZATION / ESTIMATION_ADJUSTMENT
        est_err = analytics.get("averageEstimationErrorPercentage", 0.0)
        if abs(est_err) >= 10.0:
            direction = "longer" if est_err > 0 else "faster"
            recs.append(RecommendationItem(
                type="ESTIMATION_ADJUSTMENT",
                title=f"Adjust Task Duration Estimates (+{abs(est_err)}%)",
                reason=f"Your completed tasks take an average of {abs(est_err)}% {direction} than estimated.",
                priority="MEDIUM",
                suggestedAction="Add buffer time to future task estimates"
            ))

        # 2. DEADLINE_MANAGEMENT
        overdue_tasks = [t for t in tasks if t.get('status') != 'COMPLETED' and t.get('dueDate')]
        if overdue_tasks:
            recs.append(RecommendationItem(
                type="DEADLINE_MANAGEMENT",
                title=f"Resolve {len(overdue_tasks)} Overdue Task(s)",
                reason=f"You have {len(overdue_tasks)} tasks past their target due date.",
                priority="HIGH",
                suggestedAction="Reschedule or complete overdue tasks today"
            ))

        # 3. GOAL_PROGRESS
        active_goals = [g for g in goals if g.get('status') == 'ACTIVE']
        for g in active_goals:
            if g.get('progress', 0) < 50:
                recs.append(RecommendationItem(
                    type="GOAL_PROGRESS",
                    title=f"Accelerate Progress on '{g.get('title')}'",
                    reason=f"Current progress is at {g.get('progress')}%. Complete milestones to raise goal velocity.",
                    priority="HIGH",
                    suggestedAction=f"Schedule tasks linked to goal '{g.get('title')}'"
                ))
                break

        # 4. WORKLOAD_BALANCING
        pressure = analytics.get("workloadPressure", "LOW")
        if pressure == "HIGH":
            recs.append(RecommendationItem(
                type="WORKLOAD_BALANCING",
                title="High Scheduled Workload Pressure",
                reason="Your planned daily workload exceeds your historical completed capacity.",
                priority="URGENT",
                suggestedAction="Move non-urgent tasks to tomorrow"
            ))

        return RecommendationResponse(available=True, recommendations=recs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily-plan", response_model=DailyPlanResponse)
def daily_plan_endpoint(payload: DailyPlanRequest):
    try:
        date_str = payload.date or datetime.now().strftime("%Y-%m-%d")
        tasks = payload.tasks or []
        goals = payload.goals or []
        events = payload.scheduleEvents or []
        habits = payload.habits or []
        analytics = payload.analytics or {}

        plan_data = generate_smart_daily_plan(
            date_str=date_str,
            tasks=tasks,
            goals=goals,
            schedule_events=events,
            habits=habits,
            analytics=analytics
        )

        return DailyPlanResponse(
            available=True,
            date=plan_data["date"],
            totalScheduledHours=plan_data["totalScheduledHours"],
            freeHoursRemaining=plan_data["freeHoursRemaining"],
            scheduleItems=[AIPlanItemSchema(**item) for item in plan_data["scheduleItems"]],
            reasoning=plan_data["reasoning"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
def explain_endpoint(payload: ExplainRequest):
    try:
        prompt = f"Explain the metric '{payload.metricType}' with value '{payload.metricValue}' in plain language."
        exp = call_gemini_api(prompt)
        if not exp:
            exp = f"Your recorded '{payload.metricType}' is {payload.metricValue}. Use LifeOS features to optimize this metric over time."
        return {"success": True, "explanation": exp}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
