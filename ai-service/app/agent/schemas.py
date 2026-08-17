from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SubGoalSpec(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool = False

class AgentStepSpec(BaseModel):
    id: Optional[str] = None
    stepNumber: int
    stepType: str  # OBSERVE, PLAN, TOOL_CALL, EVALUATE, USER_APPROVAL
    description: str
    toolName: Optional[str] = None
    inputSummary: Optional[Dict[str, Any]] = None
    outputSummary: Optional[Dict[str, Any]] = None
    status: str = "PENDING"  # PENDING, RUNNING, COMPLETED, FAILED, SKIPPED
    requiresApproval: bool = False
    approved: bool = False
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None

class AgentMemorySpec(BaseModel):
    id: Optional[str] = None
    userId: str
    type: str = "PREFERENCE"  # PREFERENCE, WORKFLOW, USER_DEFINED, IMPORTANT_CONTEXT
    key: str
    value: str
    source: str = "USER_EXPLICIT"
    confidence: float = 1.0

class AgentConstraintSpec(BaseModel):
    id: Optional[str] = None
    userId: str
    type: str  # NO_EARLY_MORNING, MAX_DAILY_WORKLOAD, FIXED_EVENT, PREFERRED_FOCUS_WINDOW, GOAL_PRIORITY
    value: str
    priority: str = "MEDIUM"
    active: bool = True

class AgentActionLogSpec(BaseModel):
    id: Optional[str] = None
    userId: str
    agentRunId: Optional[str] = None
    actionType: str
    targetType: Optional[str] = None
    targetId: Optional[str] = None
    oldValue: Optional[str] = None
    newValue: Optional[str] = None
    status: str = "COMPLETED"
    confirmed: bool = True
    reversible: bool = True

class AgentState(BaseModel):
    sessionId: str
    userId: str
    objective: str
    intent: str = "PLAN"
    status: str = "IDLE"  # IDLE, OBSERVING, PLANNING, WAITING_FOR_APPROVAL, EXECUTING, EVALUATING, COMPLETED, FAILED, CANCELLED
    currentStep: int = 0
    plan: List[AgentStepSpec] = []
    subgoals: List[SubGoalSpec] = []
    completedSteps: List[int] = []
    pendingSteps: List[int] = []
    toolResults: Dict[str, Any] = {}
    observations: Dict[str, Any] = {}
    errors: List[str] = []
    requiresApproval: bool = False
    approvalRequest: Optional[Dict[str, Any]] = None
    autonomyLevel: str = "AUTONOMY_2"
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now().isoformat())

class AgentRunRequest(BaseModel):
    objective: str
    userId: str = "default_user"
    conversationId: Optional[str] = None
    autonomyLevel: Optional[str] = "AUTONOMY_2"
    timezone: Optional[str] = "Asia/Kolkata"
    contextData: Optional[Dict[str, Any]] = None

class AgentRunResponsePayload(BaseModel):
    success: bool
    runId: str
    status: str
    objective: str
    currentStep: int
    totalSteps: int
    plan: List[AgentStepSpec]
    observationsSummary: Optional[Dict[str, Any]] = None
    result: Optional[str] = None
    requiresApproval: bool = False
    approvalRequest: Optional[Dict[str, Any]] = None
    trace: List[str] = []
