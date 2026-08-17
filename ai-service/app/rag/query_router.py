from typing import Tuple

def classify_query_intent(prompt: str) -> str:
    """
    Classifies prompt into LIFEOS_DATA, KNOWLEDGE_BASE, HYBRID, or GENERAL.
    """
    if not prompt:
        return "GENERAL"

    p_lower = prompt.lower()

    # Knowledge Base indicators
    kb_keywords = ["resume", "document", "pdf", "docx", "notes", "file", "kb", "knowledge base", "paper", "report", "syllabus", "notes"]
    has_kb = any(k in p_lower for k in kb_keywords)

    # LifeOS Data indicators
    lifeos_keywords = ["task", "goal", "schedule", "habit", "productivity", "score", "deadline", "streak", "analytics", "prediction", "overdue"]
    has_lifeos = any(k in p_lower for k in lifeos_keywords)

    if has_kb and has_lifeos:
        return "HYBRID"
    elif has_kb:
        return "KNOWLEDGE_BASE"
    elif has_lifeos:
        return "LIFEOS_DATA"
    
    return "GENERAL"
