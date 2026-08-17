from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PlanItemInput(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    durationMinutes: int = 45
    priority: str = "MEDIUM" # URGENT, HIGH, MEDIUM, LOW
    category: str = "General"
    energyLevel: str = "MEDIUM" # LOW, MEDIUM, HIGH
    deadline: Optional[str] = None # YYYY-MM-DD or ISO
    preferredStartTime: Optional[str] = None # HH:MM
    preferredEndTime: Optional[str] = None # HH:MM
    isFixed: bool = False
    isFlexible: bool = True
    linkedTaskId: Optional[str] = None
    linkedGoalId: Optional[str] = None
    dependencyIds: Optional[List[str]] = []
    breakAfter: int = 0 # break duration in mins
    notes: Optional[str] = None

class PlanningParameters(BaseModel):
    userId: str
    date: str # YYYY-MM-DD
    windowStart: str = "06:00" # HH:MM
    windowEnd: str = "23:00" # HH:MM
    planningStyle: str = "BALANCED" # BALANCED, DEADLINE_FIRST, FOCUS_OPTIMIZED, ENERGY_OPTIMIZED, MINIMUM_STRESS
    maxWorkloadHours: Optional[float] = None # None or float (e.g. 8.0)
    breakPreferenceMinutes: int = 15 # 0, 15, 30, 45
    items: List[PlanItemInput] = []
    existingScheduleEvents: Optional[List[Dict[str, Any]]] = []
    tasks: Optional[List[Dict[str, Any]]] = []
    goals: Optional[List[Dict[str, Any]]] = []
    habits: Optional[List[Dict[str, Any]]] = []
    analytics: Optional[Dict[str, Any]] = None
    mlPredictions: Optional[Dict[str, Any]] = None

class ScheduledPlanBlock(BaseModel):
    id: str
    title: str
    category: str = "General"
    priority: str = "MEDIUM"
    energyLevel: str = "MEDIUM"
    startTime: str # HH:MM
    endTime: str # HH:MM
    durationMinutes: int
    isBreak: bool = False
    isFixed: bool = False
    linkedTaskId: Optional[str] = None
    linkedGoalId: Optional[str] = None
    deadlineRisk: Optional[float] = None
    reason: str

class PlanScoreBreakdown(BaseModel):
    deadlineHandling: float # 0 - 100
    priorityHandling: float # 0 - 100
    scheduleFit: float # 0 - 100
    workloadBalance: float # 0 - 100
    goalAlignment: float # 0 - 100
    riskReduction: float # 0 - 100

class CandidatePlanData(BaseModel):
    planId: str
    planName: str # Plan A — Balanced, Plan B — Deadline First, Plan C — Focus Optimized, Plan D — Low Stress
    strategyKey: str # BALANCED, DEADLINE_FIRST, FOCUS_OPTIMIZED, LOW_STRESS
    overallScore: int # 0 - 100
    scoreBreakdown: PlanScoreBreakdown
    totalScheduledHours: float
    freeHoursRemaining: float
    scheduledItemsCount: int
    unscheduledItemsCount: int
    breakCount: int
    highPriorityScheduledCount: int
    scheduleBlocks: List[ScheduledPlanBlock]
    unscheduledItems: List[Dict[str, Any]] = []
    aiExplanation: str
    whyThisPlanReasons: List[str]
    strength: str
    tradeOff: str
    evidenceLevel: str = "STRONG" # STRONG, MODERATE, LIMITED

class MultiPlanGenerationResponse(BaseModel):
    available: bool = True
    date: str
    windowStart: str
    windowEnd: str
    isOverloaded: bool = False
    requiredMinutes: int = 0
    availableMinutes: int = 0
    overloadMessage: Optional[str] = None
    plans: List[CandidatePlanData] = []
    recommendedPlanId: str = "plan_a"

class PDFExportRequest(BaseModel):
    planId: str
    date: str
    planName: str
    overallScore: int
    totalScheduledHours: float
    freeHoursRemaining: float
    scheduleBlocks: List[ScheduledPlanBlock]
    scoreBreakdown: Optional[PlanScoreBreakdown] = None
    whyThisPlanReasons: Optional[List[str]] = []
    aiExplanation: Optional[str] = ""
