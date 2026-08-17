from fastapi import APIRouter, HTTPException
from typing import Optional
from app.agent.schemas import AgentRunRequest, AgentRunResponsePayload, AgentMemorySpec
from app.agent.agent import ScoutAgent
from app.agent.memory import get_user_agent_memories, add_user_agent_memory, forget_user_agent_memory

agent_router = APIRouter(prefix="/agent", tags=["SCOUT Autonomous Agent Engine"])

@agent_router.post("/run", response_model=AgentRunResponsePayload)
def run_agent_endpoint(payload: AgentRunRequest):
    try:
        return ScoutAgent.execute_objective(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Engine error: {str(e)}")

@agent_router.get("/memory")
def get_agent_memory_endpoint(userId: str = "default_user"):
    try:
        return {"success": True, "memories": [m.dict() for m in get_user_agent_memories(userId)]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory fetch error: {str(e)}")

@agent_router.post("/memory")
def add_agent_memory_endpoint(memory: AgentMemorySpec):
    try:
        added = add_user_agent_memory(memory.userId, memory)
        return {"success": True, "memory": added.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory add error: {str(e)}")

@agent_router.delete("/memory/{id}")
def forget_agent_memory_endpoint(id: str, userId: str = "default_user"):
    try:
        forgotten = forget_user_agent_memory(userId, id)
        return {"success": True, "forgotten": forgotten, "message": "Memory removed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory delete error: {str(e)}")

@agent_router.get("/health")
def agent_health():
    return {
        "status": "healthy",
        "service": "SCOUT Autonomous AI Agent Engine",
        "agentLoop": "Active (OBSERVE -> PLAN -> EXECUTE -> EVALUATE)",
        "autonomyLevels": "AUTONOMY_0 to AUTONOMY_4 Supported",
        "safety": "Constraint Revalidation & Prompt Injection Defenses Active"
    }
