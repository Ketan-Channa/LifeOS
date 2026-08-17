from typing import Dict, Any, List
from app.scout.schemas import ScoutChatRequest, ScoutResponsePayload
from app.scout.intent_classifier import classify_prompt_intent
from app.scout.context_builder import build_scout_context
from app.scout.action_planner import detect_and_plan_actions
from app.scout.tool_executor import execute_scout_tool
from app.scout.response_generator import generate_scout_response

def route_and_execute_scout_query(payload: ScoutChatRequest) -> ScoutResponsePayload:
    """
    Main orchestration router for SCOUT AI Unified Agent.
    Coordinates intent classification, context building, RAG retrieval, tool execution, action planning, and response generation.
    """
    prompt = payload.message.strip()

    # Step 1: Classify Prompt Intent
    intent = classify_prompt_intent(prompt)

    # Step 2: Build Bounded Context
    user_ctx = {
        "userId": payload.userId,
        "tasks": payload.tasks or [],
        "goals": payload.goals or [],
        "scheduleEvents": payload.scheduleEvents or [],
        "habits": payload.habits or [],
        "analytics": payload.analytics or {},
        "mlPredictions": payload.mlPredictions or {}
    }

    context = build_scout_context(
        prompt=prompt,
        intent=intent,
        user_context=user_ctx,
        timezone=payload.timezone or "Asia/Kolkata",
        history=payload.history or []
    )

    # Step 3: RAG Retrieval if Knowledge or Hybrid intent
    rag_sources = []
    if intent in ["KNOWLEDGE_QUERY", "HYBRID_QUERY"]:
        try:
            from app.rag.schemas import RAGQueryInput
            from app.rag.rag_service import answer_grounded_query
            rag_res = answer_grounded_query(
                RAGQueryInput(userId=payload.userId or "default_user", question=prompt, topK=5),
                user_lifeos_context=user_ctx
            )
            if rag_res.sources:
                rag_sources = [s.dict() for s in rag_res.sources]
        except Exception as e:
            print(f"[SCOUT RAG WARNING] {e}")

    # Step 4: Detect Proposed Write Actions
    actions = detect_and_plan_actions(prompt, user_ctx)

    # Step 5: Execute Read Tool if applicable
    if intent == "TASK_QUERY":
        execute_scout_tool("getTaskStats", {}, user_ctx)
    elif intent == "GOAL_QUERY":
        execute_scout_tool("getGoals", {}, user_ctx)

    # Step 6: Generate Structured Response Payload
    return generate_scout_response(
        prompt=prompt,
        intent=intent,
        context=context,
        actions=actions,
        rag_sources=rag_sources
    )
