from datetime import datetime
from typing import Dict, Any, List, Optional
from app.agent.schemas import AgentState, AgentStepSpec

class AgentStateManager:
    """Manages explicit AgentState transitions, steps, observations, and approval requests."""
    
    @staticmethod
    def create_initial_state(session_id: str, user_id: str, objective: str, autonomy_level: str = "AUTONOMY_2") -> AgentState:
        return AgentState(
            sessionId=session_id,
            userId=user_id,
            objective=objective,
            status="UNDERSTANDING",
            currentStep=0,
            autonomyLevel=autonomy_level
        )

    @staticmethod
    def update_status(state: AgentState, status: str) -> None:
        state.status = status
        state.updatedAt = datetime.now().isoformat()

    @staticmethod
    def set_plan(state: AgentState, plan: List[AgentStepSpec]) -> None:
        state.plan = plan
        state.pendingSteps = [s.stepNumber for s in plan]
        state.completedSteps = []
        state.currentStep = 1 if plan else 0
        state.updatedAt = datetime.now().isoformat()

    @staticmethod
    def add_observation(state: AgentState, key: str, data: Any) -> None:
        state.observations[key] = data
        state.updatedAt = datetime.now().isoformat()

    @staticmethod
    def set_approval_request(state: AgentState, request: Dict[str, Any]) -> None:
        state.requiresApproval = True
        state.approvalRequest = request
        state.status = "WAITING_FOR_APPROVAL"
        state.updatedAt = datetime.now().isoformat()

    @staticmethod
    def clear_approval_request(state: AgentState) -> None:
        state.requiresApproval = False
        state.approvalRequest = None
        state.updatedAt = datetime.now().isoformat()
