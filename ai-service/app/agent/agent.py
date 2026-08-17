from app.agent.schemas import AgentRunRequest, AgentRunResponsePayload
from app.agent.agent_loop import run_agent_loop

class ScoutAgent:
    """Primary SCOUT Autonomous Agent Interface."""
    
    @staticmethod
    def execute_objective(payload: AgentRunRequest) -> AgentRunResponsePayload:
        return run_agent_loop(payload)
