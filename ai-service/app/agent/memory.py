from typing import List, Dict, Any, Optional
from app.agent.schemas import AgentMemorySpec

# In-Memory Long-Term Preference Store (Mirrored in Express Prisma Database)
AGENT_MEMORY_STORE: Dict[str, List[AgentMemorySpec]] = {}

def get_user_agent_memories(user_id: str) -> List[AgentMemorySpec]:
    """Retrieves stored long-term preferences for a specific user."""
    return AGENT_MEMORY_STORE.get(user_id, [
        AgentMemorySpec(id="mem_1", userId=user_id, type="PREFERENCE", key="focus_block_length", value="90-minute focus blocks", source="USER_EXPLICIT"),
        AgentMemorySpec(id="mem_2", userId=user_id, type="PREFERENCE", key="planning_style", value="Multiple candidate planning options (Plan A/B/C/D)", source="USER_EXPLICIT")
    ])

def add_user_agent_memory(user_id: str, memory: AgentMemorySpec) -> AgentMemorySpec:
    """Adds a new explicit long-term memory preference after user confirmation."""
    memories = get_user_agent_memories(user_id)
    # Check for duplicate key
    existing = [m for m in memories if m.key == memory.key]
    if existing:
        existing[0].value = memory.value
        return existing[0]
    
    memories.append(memory)
    AGENT_MEMORY_STORE[user_id] = memories
    return memory

def forget_user_agent_memory(user_id: str, memory_id_or_key: str) -> bool:
    """Explicit 'Forget This' memory deletion."""
    memories = get_user_agent_memories(user_id)
    filtered = [m for m in memories if m.id != memory_id_or_key and m.key != memory_id_or_key]
    AGENT_MEMORY_STORE[user_id] = filtered
    return len(filtered) < len(memories)
