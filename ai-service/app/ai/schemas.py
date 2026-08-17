from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[ChatMessage]] = []
    userId: str
    timezone: str = "UTC"
    dateRange: str = "last_30_days"
    tasks: Optional[List[Dict[str, Any]]] = []
    goals: Optional[List[Dict[str, Any]]] = []
    scheduleEvents: Optional[List[Dict[str, Any]]] = []
    habits: Optional[List[Dict[str, Any]]] = []
    analytics: Optional[Dict[str, Any]] = None

class RecommendationRequest(BaseModel):
    userId: str
    tasks: Optional[List[Dict[str, Any]]] = []
    goals: Optional[List[Dict[str, Any]]] = []
    scheduleEvents: Optional[List[Dict[str, Any]]] = []
    habits: Optional[List[Dict[str, Any]]] = []
    analytics: Optional[Dict[str, Any]] = None

class RecommendationItem(BaseModel):
    type: str # TIME_OPTIMIZATION, TASK_PRIORITY, WORKLOAD_BALANCING, DEADLINE_MANAGEMENT, GOAL_PROGRESS, ESTIMATION_ADJUSTMENT, POSTPONEMENT_REDUCTION, SCHEDULE_OPTIMIZATION
    title: str
    reason: str
    priority: str = "MEDIUM" # LOW, MEDIUM, HIGH, URGENT
    suggestedAction: Optional[str] = None

class RecommendationResponse(BaseModel):
    available: bool = True
    recommendations: List[RecommendationItem] = []

class DailyPlanRequest(BaseModel):
    userId: str
    date: str # YYYY-MM-DD
    tasks: Optional[List[Dict[str, Any]]] = []
    goals: Optional[List[Dict[str, Any]]] = []
    scheduleEvents: Optional[List[Dict[str, Any]]] = []
    habits: Optional[List[Dict[str, Any]]] = []
    analytics: Optional[Dict[str, Any]] = None

class AIPlanItemSchema(BaseModel):
    title: str
    category: str = "General"
    priority: str = "MEDIUM"
    startTime: str
    endTime: str
    durationMinutes: int
    relatedTaskId: Optional[str] = None
    relatedGoalId: Optional[str] = None
    reason: str

class DailyPlanResponse(BaseModel):
    available: bool = True
    date: str
    totalScheduledHours: float = 0.0
    freeHoursRemaining: float = 0.0
    scheduleItems: List[AIPlanItemSchema] = []
    reasoning: str

class ExplainRequest(BaseModel):
    metricType: str
    metricValue: Any
    context: Optional[Dict[str, Any]] = None
