from typing import Dict, Any, List
from app.scout.tool_registry import SCOUT_TOOL_REGISTRY, get_tool_spec

def execute_scout_tool(tool_name: str, input_data: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes a registered SCOUT read tool or validates permission for write tools.
    """
    spec = get_tool_spec(tool_name)

    if spec.permission == "WRITE" or spec.requiresConfirmation:
        return {
            "toolName": tool_name,
            "status": "REQUIRES_CONFIRMATION",
            "message": f"Tool '{tool_name}' requires user confirmation before execution.",
            "requiresConfirmation": True
        }

    # Execute READ tools
    tasks = user_context.get("tasks", [])
    goals = user_context.get("goals", [])
    schedule = user_context.get("scheduleEvents", [])
    habits = user_context.get("habits", [])
    analytics = user_context.get("analytics", {})

    if tool_name in ["getTasks", "getTask"]:
        return {"toolName": tool_name, "status": "COMPLETED", "result": tasks}

    elif tool_name == "getTaskStats":
        completed = len([t for t in tasks if t.get("status") == "COMPLETED"])
        pending = len([t for t in tasks if t.get("status") != "COMPLETED"])
        return {
            "toolName": tool_name,
            "status": "COMPLETED",
            "result": {
                "totalTasks": len(tasks),
                "completedCount": completed,
                "pendingCount": pending,
                "completionRate": round((completed / len(tasks) * 100), 1) if tasks else 100.0
            }
        }

    elif tool_name == "getGoals":
        return {"toolName": tool_name, "status": "COMPLETED", "result": goals}

    elif tool_name == "getTodaySchedule":
        return {"toolName": tool_name, "status": "COMPLETED", "result": schedule}

    elif tool_name == "getHabits":
        return {"toolName": tool_name, "status": "COMPLETED", "result": habits}

    elif tool_name == "getAnalytics":
        return {"toolName": tool_name, "status": "COMPLETED", "result": analytics}

    elif tool_name == "searchKnowledge":
        try:
            from app.rag.schemas import VectorSearchQuery
            from app.rag.retriever import retrieve_relevant_chunks
            query_text = input_data.get("queryText", "")
            user_id = user_context.get("userId", "default_user")
            res = retrieve_relevant_chunks(VectorSearchQuery(userId=user_id, queryText=query_text, topK=5))
            return {"toolName": tool_name, "status": "COMPLETED", "result": [r.dict() for r in res]}
        except Exception as e:
            return {"toolName": tool_name, "status": "FAILED", "error": str(e)}

    return {"toolName": tool_name, "status": "COMPLETED", "result": "Telemetry context evaluated."}
