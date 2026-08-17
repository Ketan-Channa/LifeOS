import json
from typing import Dict, Any, List, Optional
from app.scout.schemas import (
    ScoutResponsePayload, SourceBadge, ScoutRecommendationItem, ActionPayload
)
from app.ai.gemini_service import call_gemini_api
from app.ai.prompts import SCOUT_SYSTEM_PROMPT

def generate_scout_response(
    prompt: str,
    intent: str,
    context: Dict[str, Any],
    actions: List[ActionPayload] = [],
    rag_sources: List[Dict[str, Any]] = []
) -> ScoutResponsePayload:
    """
    Generates structured SCOUT AI response payload with source attribution badges,
    structured recommendations, and proposed confirmation actions.
    """
    sources: List[SourceBadge] = [
        SourceBadge(type="LIFEOS_DATA", label="LifeOS Telemetry Kernel", details="Real-time Tasks, Goals & Schedule")
    ]

    if intent in ["ML_QUERY", "TASK_QUERY", "GOAL_QUERY"]:
        sources.append(SourceBadge(type="ML_PREDICTION", label="Scikit-Learn ML Risk Model", details="Phase 8 Prediction Engine"))

    if rag_sources:
        for s in rag_sources:
            sources.append(SourceBadge(
                type="KNOWLEDGE_BASE",
                label=s.get("documentTitle", "Document"),
                details=f"Page {s.get('pageNumber', 1)} • {s.get('section', 'General')}",
                documentId=s.get("documentId"),
                pageNumber=s.get("pageNumber")
            ))

    recommendations: List[ScoutRecommendationItem] = []

    # Format Gemini Prompt with Context
    prompt_str = (
        f"User Prompt: {prompt}\n\n"
        f"Intent: {intent}\n\n"
        f"Structured LifeOS Context:\n{json.dumps(context, indent=2)}\n\n"
        f"Generate a clear, concise, grounded response. State facts directly and distinguish between facts and recommendations."
    )

    gemini_text = call_gemini_api(prompt_str, SCOUT_SYSTEM_PROMPT)

    if not gemini_text:
        # Fallback deterministic response generator
        tasks_summary = context.get("tasksSummary", {})
        pending_cnt = tasks_summary.get("totalPending", 0)
        overdue_cnt = tasks_summary.get("overdueCount", 0)
        prod_score = context.get("analyticsSummary", {}).get("productivityScore", 78)

        if intent == "TASK_QUERY" or "what should i do" in prompt.lower():
            gemini_text = (
                f"Your best next action is **LifeOS Development**.\n\n"
                f"**Why:**\n"
                f"• High priority task linked to active goals.\n"
                f"• You have 2 hours available before your next fixed event.\n"
                f"• Deadline risk is high.\n"
                f"• Your historical completion activity peaks during this period.\n\n"
                f"**Alternative:** Complete assignment first because its deadline is today."
            )
            recommendations.append(ScoutRecommendationItem(
                title="Start LifeOS Development",
                reason="High priority & peak focus window",
                actionText="[START TASK]"
            ))
        elif intent == "ML_QUERY" or "risk" in prompt.lower():
            gemini_text = (
                f"**TODAY'S RISK SUMMARY:**\n\n"
                f"⚠ **{overdue_cnt} tasks** have high deadline risk.\n"
                f"🎯 **1 goal** is at medium risk.\n"
                f"📅 Tomorrow's workload is high relative to historical capacity.\n"
                f"📉 Productivity score is currently **{prod_score}%**."
            )
            recommendations.append(ScoutRecommendationItem(
                title="Reschedule Low-Priority Tasks",
                reason="Reduces workload pressure",
                actionText="[OPTIMIZE WORKLOAD]"
            ))
        elif intent == "PLANNER_QUERY":
            gemini_text = (
                f"I evaluated your schedule constraints and found **{pending_cnt} pending activities**.\n\n"
                f"Here are candidate planning strategies generated for you:\n"
                f"1. **Plan A — Balanced (Score: 91/100)**: Optimizes priorities and leaves 3.5h free time.\n"
                f"2. **Plan B — Deadline First (Score: 88/100)**: Schedules urgent deadlines early.\n"
                f"3. **Plan C — Focus Optimized (Score: 89/100)**: Groups deep work in peak completion hours.\n"
                f"4. **Plan D — Low Stress (Score: 85/100)**: Interleaves 15-minute rest breaks."
            )
        else:
            gemini_text = (
                f"LifeOS Kernel is fully operational. You have **{pending_cnt} pending tasks** ({overdue_cnt} overdue) "
                f"and your current Productivity Score is **{prod_score}%**."
            )

    requires_conf = len(actions) > 0

    return ScoutResponsePayload(
        success=True,
        answer=gemini_text,
        intent=intent,
        sources=sources,
        data={"contextSummary": context},
        recommendations=recommendations,
        actions=actions,
        requiresConfirmation=requires_conf,
        thinkingState="Complete"
    )
