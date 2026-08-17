from typing import List, Dict, Any
from app.planner.schemas import PlanScoreBreakdown

def score_candidate_plan(
    scheduled_blocks: List[Dict[str, Any]],
    unscheduled_items: List[Dict[str, Any]],
    total_window_mins: int,
    total_requested_items: int
) -> tuple[int, PlanScoreBreakdown]:
    """
    Computes a deterministic 100-point score for a candidate daily plan.
    """
    if total_requested_items == 0:
        return 100, PlanScoreBreakdown(
            deadlineHandling=100.0,
            priorityHandling=100.0,
            scheduleFit=100.0,
            workloadBalance=100.0,
            goalAlignment=100.0,
            riskReduction=100.0
        )

    task_blocks = [b for b in scheduled_blocks if not b.get('isBreak')]
    scheduled_cnt = len(task_blocks)
    unscheduled_cnt = len(unscheduled_items)

    # 1. Deadline Handling (25%)
    today_items = [b for b in task_blocks if b.get('priority') == 'URGENT']
    today_unsched = [u for u in unscheduled_items if u.get('item', {}).get('priority') == 'URGENT']
    deadline_score = 100.0 if not (today_items or today_unsched) else round(len(today_items) / max(1, len(today_items) + len(today_unsched)) * 100.0, 1)

    # 2. Priority Handling (20%)
    high_items = [b for b in task_blocks if b.get('priority') in ['URGENT', 'HIGH']]
    high_unsched = [u for u in unscheduled_items if u.get('item', {}).get('priority') in ['URGENT', 'HIGH']]
    prio_score = round(len(high_items) / max(1, len(high_items) + len(high_unsched)) * 100.0, 1)

    # 3. Schedule Fit (20%)
    fit_score = round((scheduled_cnt / max(1, total_requested_items)) * 100.0, 1)

    # 4. Workload Balance (15%)
    workload_mins = sum(b.get('durationMinutes', 0) for b in task_blocks)
    if workload_mins == 0:
        workload_score = 100.0
    elif workload_mins <= 480: # <= 8 hours
        workload_score = 92.0
    elif workload_mins <= 600: # <= 10 hours
        workload_score = 80.0
    else:
        workload_score = 65.0

    # 5. Goal Alignment (10%)
    goal_items = [b for b in task_blocks if b.get('linkedGoalId')]
    goal_score = 90.0 if goal_items else 75.0

    # 6. Risk Reduction (10%)
    risk_score = 88.0

    # Weighted Overall Score Calculation
    overall = (
        deadline_score * 0.25 +
        prio_score * 0.20 +
        fit_score * 0.20 +
        workload_score * 0.15 +
        goal_score * 0.10 +
        risk_score * 0.10
    )

    overall_int = int(round(min(100.0, max(0.0, overall))))

    breakdown = PlanScoreBreakdown(
        deadlineHandling=deadline_score,
        priorityHandling=prio_score,
        scheduleFit=fit_score,
        workloadBalance=workload_score,
        goalAlignment=goal_score,
        riskReduction=risk_score
    )

    return overall_int, breakdown
