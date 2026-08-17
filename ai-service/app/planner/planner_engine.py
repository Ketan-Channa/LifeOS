import json
from typing import Dict, Any, List
from app.planner.schemas import (
    PlanningParameters,
    CandidatePlanData,
    MultiPlanGenerationResponse
)
from app.planner.constraints import parse_time_to_mins, ConstraintEngine
from app.planner.candidate_generator import generate_candidate_schedule
from app.planner.plan_scorer import score_candidate_plan
from app.planner.plan_validator import validate_candidate_plan
from app.ai.gemini_service import call_gemini_api

def generate_multi_candidate_plans(params: PlanningParameters) -> MultiPlanGenerationResponse:
    """
    Hybrid planning engine orchestrator:
    1. Parse window bounds & constraints
    2. Check capacity overload
    3. Generate 4 candidate plans (Balanced, Deadline First, Focus Optimized, Low Stress)
    4. Compute deterministic plan scores
    5. Validate constraints
    6. Synthesize Gemini explanations
    """
    w_start_mins = parse_time_to_mins(params.windowStart) or (6 * 60)
    w_end_mins = parse_time_to_mins(params.windowEnd) or (23 * 60)
    if w_end_mins <= w_start_mins:
        w_end_mins = w_start_mins + 600 # Fallback 10 hrs

    # Convert items & existing events to dicts
    input_items_dicts = [item.dict() for item in params.items]
    existing_events_dicts = params.existingScheduleEvents or []

    # 1. Constraint & Capacity Check
    blocked = ConstraintEngine.get_blocked_intervals(w_start_mins, w_end_mins, existing_events_dicts, input_items_dicts)
    capacity = ConstraintEngine.calculate_capacity(w_start_mins, w_end_mins, blocked, input_items_dicts)

    # Strategies to generate
    strategies = [
        ("plan_a", "Plan A — Balanced", "BALANCED", "Optimizes overall priority, deadline balance, and focus windows.", "Strong balanced schedule across all domains.", "Slightly tighter break spacing."),
        ("plan_b", "Plan B — Deadline First", "DEADLINE_FIRST", "Prioritizes imminent deadlines and high ML deadline risk items.", "Eliminates deadline risk early in the day.", "Higher context switching early on."),
        ("plan_c", "Plan C — Focus Optimized", "FOCUS_OPTIMIZED", "Groups high-energy deep work tasks in peak recorded completion hours.", "Maximizes continuous deep work momentum.", "Less free time in peak focus window."),
        ("plan_d", "Plan D — Low Stress", "LOW_STRESS", "Distributes workload with frequent breaks to reduce fatigue.", "Lower stress and regular rest buffers.", "Extends overall completion time.")
    ]

    candidate_plans: List[CandidatePlanData] = []
    best_score = -1
    recommended_id = "plan_a"

    for p_id, p_name, strat_key, p_desc, p_strength, p_tradeoff in strategies:
        sched_blocks, unsched_items, break_cnt = generate_candidate_schedule(
            strategy_key=strat_key,
            window_start_mins=w_start_mins,
            window_end_mins=w_end_mins,
            blocked_intervals=blocked,
            items=input_items_dicts,
            break_pref_mins=params.breakPreferenceMinutes,
            max_workload_hours=params.maxWorkloadHours
        )

        overall_score, breakdown = score_candidate_plan(
            scheduled_blocks=sched_blocks,
            unscheduled_items=unsched_items,
            total_window_mins=capacity["totalWindowMinutes"],
            total_requested_items=len(input_items_dicts)
        )

        # Validate schedule
        is_valid, validation_errors = validate_candidate_plan(sched_blocks, w_start_mins, w_end_mins)

        # Calculate scheduled vs free hours
        task_mins = sum(b['durationMinutes'] for b in sched_blocks if not b.get('isBreak'))
        sched_hrs = round(task_mins / 60.0, 1)
        free_hrs = round(max(0, capacity["availableMinutes"] - task_mins) / 60.0, 1)

        # Generate "Why This Plan?" reasons based on actual inputs
        reasons = [
            f"Aligned with {strat_key.replace('_', ' ').title()} strategy objectives.",
            f"Schedules {len([b for b in sched_blocks if not b.get('isBreak')])} task blocks within {w_start_mins//60:02d}:00–{w_end_mins//60:02d}:00 bounds.",
            f"Leaves {free_hrs}h free buffer time."
        ]
        if any(b.get('priority') == 'URGENT' for b in sched_blocks):
            reasons.append("URGENT deadline items given priority placement.")

        # Gemini Explanation Synthesis
        ai_exp_prompt = f"Explain in 2 sentences why '{p_name}' with score {overall_score}/100 is optimal for the user's date {params.date}."
        gemini_exp = call_gemini_api(ai_exp_prompt)
        if not gemini_exp:
            gemini_exp = f"{p_desc} Scheduled {len([b for b in sched_blocks if not b.get('isBreak')])} activities with an overall plan score of {overall_score}/100."

        if overall_score > best_score:
            best_score = overall_score
            recommended_id = p_id

        candidate_plans.append(CandidatePlanData(
            planId=p_id,
            planName=p_name,
            strategyKey=strat_key,
            overallScore=overall_score,
            scoreBreakdown=breakdown,
            totalScheduledHours=sched_hrs,
            freeHoursRemaining=free_hrs,
            scheduledItemsCount=len([b for b in sched_blocks if not b.get('isBreak')]),
            unscheduledItemsCount=len(unsched_items),
            breakCount=break_cnt,
            highPriorityScheduledCount=len([b for b in sched_blocks if b.get('priority') in ['URGENT', 'HIGH']]),
            scheduleBlocks=sched_blocks,
            unscheduledItems=unsched_items,
            aiExplanation=gemini_exp,
            whyThisPlanReasons=reasons,
            strength=p_strength,
            tradeOff=p_tradeoff,
            evidenceLevel="STRONG" if params.analytics else "MODERATE"
        ))

    return MultiPlanGenerationResponse(
        available=True,
        date=params.date,
        windowStart=params.windowStart,
        windowEnd=params.windowEnd,
        isOverloaded=capacity["isOverloaded"],
        requiredMinutes=capacity["requiredMinutes"],
        availableMinutes=capacity["availableMinutes"],
        overloadMessage=capacity["overloadMessage"],
        plans=candidate_plans,
        recommendedPlanId=recommended_id
    )
