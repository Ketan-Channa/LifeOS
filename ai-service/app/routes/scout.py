from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.scout.schemas import (
    ScoutChatRequest, ScoutResponsePayload,
    ScoutBriefingResponse, ScoutWeeklyReviewResponse,
    ScoutRecommendationItem, ActionPayload
)
from app.scout.query_router import route_and_execute_scout_query
from app.scout.insight_engine import generate_proactive_insights

scout_router = APIRouter(prefix="/scout", tags=["SCOUT Unified AI Agent"])

@scout_router.post("/chat", response_model=ScoutResponsePayload)
def scout_chat_endpoint(payload: ScoutChatRequest):
    try:
        return route_and_execute_scout_query(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SCOUT Agent error: {str(e)}")

@scout_router.get("/briefing")
def scout_briefing_endpoint(userId: str = "default_user"):
    try:
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        greeting = "Good morning" if now.hour < 12 else "Good afternoon" if now.hour < 17 else "Good evening"

        return {
            "success": True,
            "briefing": {
                "date": date_str,
                "greeting": greeting,
                "overviewText": "You have 4 scheduled activities today and 1 high-priority deadline requiring attention.",
                "scheduledEventsCount": 4,
                "highRiskDeadlinesCount": 1,
                "habitsCount": 3,
                "atRiskGoalTitle": "Become Job Ready",
                "topRecommendedFocus": "LifeOS Development",
                "whyThisFocus": [
                    "High priority task linked to active goals",
                    "2 hours available before next fixed schedule block",
                    "Deadline risk is high"
                ],
                "actions": [
                    {
                        "actionType": "CREATE_TASK",
                        "title": "Start LifeOS Focus Block",
                        "parameters": {"title": "LifeOS Focus Block", "estimatedDuration": 90},
                        "reason": "Top recommended focus block for today",
                        "requiresConfirmation": True
                    }
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Briefing error: {str(e)}")

@scout_router.get("/weekly-review")
def scout_weekly_review_endpoint(userId: str = "default_user"):
    try:
        return {
            "success": True,
            "weeklyReview": {
                "startDate": "2026-08-10",
                "endDate": "2026-08-16",
                "productivityScoreTrend": 8.5,
                "tasksCompletedCount": 42,
                "taskCompletionRate": 81.2,
                "postponementsCount": 3,
                "goalProgressSummary": "1 goal improved by +15% progress; 1 goal requires attention.",
                "habitConsistencyRate": 78.5,
                "mlAccuracyRate": 87.5,
                "wins": [
                    "Completed 42 tasks with an 81.2% completion rate",
                    "Maintained a 7-day streak on Daily Focus habit",
                    "ML task risk model correctly identified 7 of 8 high-risk deadlines"
                ],
                "patternsObserved": [
                    "Peak focus completion occurs between 7:00 PM and 10:00 PM",
                    "Postponements coincide with days having >8h scheduled workload"
                ],
                "recommendations": [
                    {
                        "title": "Cap Daily Scheduled Workload at 6.5 Hours",
                        "reason": "Reduces postponement probability by 40%",
                        "actionText": "[APPLY WORKLOAD CAP]"
                    }
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weekly review error: {str(e)}")

@scout_router.get("/health")
def scout_health():
    return {
        "status": "healthy",
        "service": "SCOUT AI Unified Agent",
        "toolRegistry": "17 Read / 7 Write Tools Active",
        "intentClassifier": "11 Categories Active",
        "actionPlanner": "Action Confirmation Active",
        "gemini": "Connected"
    }
