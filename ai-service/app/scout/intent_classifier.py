import re

INTENT_CATEGORIES = [
    "TASK_QUERY",
    "GOAL_QUERY",
    "SCHEDULE_QUERY",
    "HABIT_QUERY",
    "ANALYTICS_QUERY",
    "ML_QUERY",
    "PLANNER_QUERY",
    "KNOWLEDGE_QUERY",
    "HYBRID_QUERY",
    "ACTION_REQUEST",
    "GENERAL_QUERY"
]

def classify_prompt_intent(prompt: str) -> str:
    """
    Classifies a natural language prompt into one of 11 structured intent categories.
    """
    if not prompt or not prompt.strip():
        return "GENERAL_QUERY"

    p_lower = prompt.lower().strip()

    # Action intent keywords (create, update, move, postpone, schedule, complete)
    action_keywords = [
        "create a task", "create task", "add task", "new task",
        "postpone", "move my", "move task", "reschedule",
        "create a goal", "create goal", "add goal",
        "schedule ", "add to schedule", "apply plan"
    ]
    if any(k in p_lower for k in action_keywords):
        return "ACTION_REQUEST"

    # Planner intent keywords
    planner_keywords = ["plan my day", "plan tomorrow", "daily plan", "planning options", "4 plans", "generate plan", "candidate plans"]
    if any(k in p_lower for k in planner_keywords):
        return "PLANNER_QUERY"

    # RAG / Knowledge Base keywords
    kb_keywords = ["resume", "document", "pdf", "docx", "notes", "file", "knowledge base", "search my", "paper", "report", "syllabus"]
    has_kb = any(k in p_lower for k in kb_keywords)

    # LifeOS System keywords
    task_keywords = ["task", "todo", "overdue", "postponing", "work on", "priority", "priorities"]
    goal_keywords = ["goal", "milestone", "target", "progress"]
    schedule_keywords = ["schedule", "evening", "morning", "today's summary", "busy", "calendar", "free time", "overloaded"]
    habit_keywords = ["habit", "routine", "streak", "consistency"]
    analytics_keywords = ["productivity", "analytics", "productive", "less productive", "estimation error"]
    ml_keywords = ["ml", "prediction", "forecast", "risk", "deadline risk", "workload risk", "at risk"]

    has_task = any(k in p_lower for k in task_keywords)
    has_goal = any(k in p_lower for k in goal_keywords)
    has_schedule = any(k in p_lower for k in schedule_keywords)
    has_habit = any(k in p_lower for k in habit_keywords)
    has_analytics = any(k in p_lower for k in analytics_keywords)
    has_ml = any(k in p_lower for k in ml_keywords)

    # Count distinct domain systems
    domain_count = sum([has_kb, has_task, has_goal, has_schedule, has_habit, has_analytics, has_ml])

    if domain_count >= 2:
        return "HYBRID_QUERY"

    if has_kb:
        return "KNOWLEDGE_QUERY"
    if has_ml:
        return "ML_QUERY"
    if has_analytics:
        return "ANALYTICS_QUERY"
    if has_habit:
        return "HABIT_QUERY"
    if has_schedule:
        return "SCHEDULE_QUERY"
    if has_goal:
        return "GOAL_QUERY"
    if has_task or "do now" in p_lower or "should i do" in p_lower:
        return "TASK_QUERY"

    return "GENERAL_QUERY"
