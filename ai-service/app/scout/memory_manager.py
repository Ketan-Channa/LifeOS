from typing import List, Dict, Any

def summarize_conversation_memory(messages: List[Dict[str, Any]]) -> str:
    """
    Summarizes older conversation turns to maintain bounded LLM memory.
    """
    if not messages or len(messages) <= 4:
        return ""

    user_intents = [m.get("intent") for m in messages if m.get("role") == "user" and m.get("intent")]
    intents_str = ", ".join(set(user_intents)) if user_intents else "general productivity queries"

    return f"Previous conversation covered {len(messages)} messages focusing on: {intents_str}."
