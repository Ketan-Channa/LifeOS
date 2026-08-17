from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ScoutChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    userId: Optional[str] = "default_user"
    timezone: Optional[str] = "Asia/Kolkata"
    history: Optional[List[Dict[str, Any]]] = []
    tasks: Optional[List[Dict[str, Any]]] = []
    goals: Optional[List[Dict[str, Any]]] = []
    scheduleEvents: Optional[List[Dict[str, Any]]] = []
    habits: Optional[List[Dict[str, Any]]] = []
    analytics: Optional[Dict[str, Any]] = {}
    mlPredictions: Optional[Dict[str, Any]] = {}

class ToolCallSpec(BaseModel):
    name: str
    inputData: Dict[str, Any] = {}
    permission: str = "READ" # READ or WRITE
    requiresConfirmation: bool = False

class ActionPayload(BaseModel):
    actionType: str # CREATE_TASK, UPDATE_TASK, POSTPONE_TASK, COMPLETE_TASK, CREATE_SCHEDULE_EVENT, UPDATE_SCHEDULE_EVENT, CREATE_GOAL
    targetId: Optional[str] = None
    title: str
    parameters: Dict[str, Any] = {}
    oldValue: Optional[Any] = None
    newValue: Optional[Any] = None
    reason: str
    requiresConfirmation: bool = True

class SourceBadge(BaseModel):
    type: str # LIFEOS_DATA, KNOWLEDGE_BASE, ML_PREDICTION, AI_RECOMMENDATION
    label: str
    details: Optional[str] = None
    documentId: Optional[str] = None
    pageNumber: Optional[int] = None

class ScoutRecommendationItem(BaseModel):
    title: str
    reason: str
    actionText: str
    actionType: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class ScoutResponsePayload(BaseModel):
    success: bool = True
    conversationId: Optional[str] = None
    answer: str
    intent: str = "GENERAL_QUERY"
    sources: List[SourceBadge] = []
    data: Dict[str, Any] = {}
    recommendations: List[ScoutRecommendationItem] = []
    actions: List[ActionPayload] = []
    requiresConfirmation: bool = False
    thinkingState: Optional[str] = "Complete"

class ScoutBriefingResponse(BaseModel):
    date: str
    greeting: str
    overviewText: str
    scheduledEventsCount: int
    highRiskDeadlinesCount: int
    habitsCount: int
    atRiskGoalTitle: Optional[str] = None
    topRecommendedFocus: str
    whyThisFocus: List[str] = []
    actions: List[ActionPayload] = []

class ScoutWeeklyReviewResponse(BaseModel):
    startDate: str
    endDate: str
    productivityScoreTrend: float
    tasksCompletedCount: int
    taskCompletionRate: float
    postponementsCount: int
    goalProgressSummary: str
    habitConsistencyRate: float
    mlAccuracyRate: float
    wins: List[str] = []
    patternsObserved: List[str] = []
    recommendations: List[ScoutRecommendationItem] = []
