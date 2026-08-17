from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TaskRiskRequest(BaseModel):
    taskId: Optional[str] = None
    title: str
    category: str = "General"
    priority: str = "MEDIUM"
    estimatedMinutes: int = 30
    energyLevel: str = "MEDIUM"
    dueDate: Optional[str] = None
    previousPostponements: int = 0
    currentWorkloadHours: float = 4.0

class TaskRiskResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    riskLevel: str = "LOW" # LOW, MEDIUM, HIGH
    riskProbability: float = 0.15
    postponementProbability: float = 0.20
    modelVersion: str = "task-risk-v1"
    topFactors: List[str] = []

class GoalRiskRequest(BaseModel):
    goalId: Optional[str] = None
    title: str
    category: str = "General"
    priority: str = "MEDIUM"
    progress: float = 0.0
    daysRemaining: int = 30
    milestonesTotal: int = 5
    milestonesCompleted: int = 2
    linkedTaskPostponementRate: float = 0.10

class GoalRiskResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    completionProbability: float = 0.78
    riskLevel: str = "MEDIUM" # LOW, MEDIUM, HIGH
    requiredDailyProgress: float = 1.07
    historicalVelocity: float = 1.50
    modelVersion: str = "goal-risk-v1"
    recommendation: Optional[str] = None

class ProductivityForecastResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    todayScore: int = 78
    tomorrowForecast: int = 74
    forecastRange: List[int] = [70, 78]
    trend: str = "STABLE" # IMPROVING, STABLE, DECLINING
    modelVersion: str = "productivity-v1"

class WorkloadRiskResponse(BaseModel):
    available: bool = True
    reason: Optional[str] = None
    workloadRisk: str = "NORMAL" # LOW, NORMAL, HIGH
    riskProbability: float = 0.35
    scheduledHours: float = 5.5
    historicalCapacity: float = 6.0
    modelVersion: str = "workload-risk-v1"
    suggestedAction: Optional[str] = None

class ModelMetadata(BaseModel):
    modelName: str
    version: str
    trainedAt: str
    trainingSamples: int
    testSamples: int
    evaluationMetrics: Dict[str, float]
    featureNames: List[str]

class PredictionsOverviewResponse(BaseModel):
    available: bool = True
    highRiskTasksCount: int = 0
    mediumRiskTasksCount: int = 0
    highRiskGoalsCount: int = 0
    tomorrowWorkloadRisk: str = "NORMAL"
    tomorrowProductivityForecast: int = 75
    modelsLoaded: List[str] = []
