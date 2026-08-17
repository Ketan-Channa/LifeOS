from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TaskHistoryInput(BaseModel):
    id: str
    taskId: str
    action: str
    previousStatus: Optional[str] = None
    newStatus: Optional[str] = None
    previousDueDate: Optional[str] = None
    newDueDate: Optional[str] = None
    timestamp: str

class TaskInput(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str = "General"
    priority: str = "MEDIUM"
    status: str = "TODO"
    dueDate: Optional[str] = None
    estimatedMinutes: int = 30
    actualMinutes: int = 0
    energyLevel: str = "MEDIUM"
    createdAt: str
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    taskHistories: Optional[List[TaskHistoryInput]] = []

class GoalHistoryInput(BaseModel):
    id: str
    goalId: str
    action: str
    previousProgress: Optional[float] = None
    newProgress: Optional[float] = None
    previousStatus: Optional[str] = None
    newStatus: Optional[str] = None
    timestamp: str

class MilestoneInput(BaseModel):
    id: str
    goalId: str
    title: str
    order: int = 1
    completed: bool = False
    completedAt: Optional[str] = None

class GoalInput(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str = "General"
    priority: str = "MEDIUM"
    startDate: Optional[str] = None
    targetDate: Optional[str] = None
    progress: float = 0.0
    status: str = "ACTIVE"
    createdAt: str
    milestones: Optional[List[MilestoneInput]] = []
    goalHistories: Optional[List[GoalHistoryInput]] = []

class HabitInput(BaseModel):
    id: str
    name: str
    category: str = "Health"
    frequency: str = "DAILY"
    currentStreak: int = 0
    longestStreak: int = 0

class AnalyticsPayload(BaseModel):
    userId: str
    timezone: str = "UTC"
    dateRange: str = "last_30_days" # last_7_days, last_14_days, last_30_days, last_90_days, all_time
    tasks: List[TaskInput] = []
    goals: List[GoalInput] = []
    habits: List[HabitInput] = []

class ProductivityScoreComponents(BaseModel):
    completionRate: float = 0.0
    onTimeRate: float = 0.0
    estimationAccuracy: float = 0.0
    goalProgress: float = 0.0

class ProductivityScoreResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    score: int = 0
    components: ProductivityScoreComponents = Field(default_factory=ProductivityScoreComponents)
    trend: str = "STABLE" # IMPROVING, STABLE, DECLINING
    trendChangePoints: float = 0.0
    dataPoints: int = 0

class PatternInsight(BaseModel):
    type: str
    title: str
    description: str
    metric: str
    value: float
    unit: str
    confidence: float # 0.0 to 1.0
    confidenceLabel: str # STRONG, MODERATE, INITIAL
    dataPoints: int
    period: str

class AnalyticsOverviewResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    productivityScore: ProductivityScoreResponse
    taskCompletionRate: float = 0.0
    onTimeCompletionRate: float = 0.0
    averageEstimationErrorPercentage: float = 0.0
    averageDelayMinutes: float = 0.0
    postponementRatePercentage: float = 0.0
    workloadPressure: str = "LOW" # LOW, MEDIUM, HIGH
    topPatterns: List[PatternInsight] = []
