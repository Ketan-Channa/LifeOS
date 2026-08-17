from typing import List, Dict, Any
from app.analytics.schemas import TaskInput, GoalInput, PatternInsight
from app.analytics.statistics import calculate_productivity_score
from app.analytics.task_analysis import analyze_task_performance
from app.analytics.workload_analysis import analyze_workload
from app.analytics.goal_analysis import analyze_goals

def detect_behavioral_patterns(tasks: List[TaskInput], goals: List[GoalInput], date_range: str = 'last_30_days') -> List[PatternInsight]:
    patterns: List[PatternInsight] = []
    task_res = analyze_task_performance(tasks, date_range)
    workload_res = analyze_workload(tasks, date_range)
    goal_res = analyze_goals(goals)

    if not task_res.get("available", False):
        return []

    completed_count = task_res.get("completedTasks", 0)

    # Helper function to compute statistical confidence based on sample size
    def compute_confidence(n: int) -> tuple[float, str]:
        if n < 5:
            return 0.45, "INITIAL"
        elif n < 15:
            return 0.65, "INITIAL"
        elif n < 30:
            return 0.78, "MODERATE"
        else:
            return 0.92, "STRONG"

    conf_score, conf_label = compute_confidence(completed_count)

    # 1. PRODUCTIVE_TIME Pattern (Peak Hour)
    peak_hour = task_res.get("peakHour", 19)
    peak_count = task_res.get("peakHourCount", 0)
    if peak_count >= 2:
        hour_12 = peak_hour % 12 or 12
        ampm = "PM" if peak_hour >= 12 else "AM"
        time_str = f"{hour_12} {ampm}"

        patterns.append(PatternInsight(
            type="PRODUCTIVE_TIME",
            title=f"Highest Task Completion around {time_str}",
            description=f"Your highest recorded task completion activity occurs around {time_str} ({peak_count} tasks completed).",
            metric="peakCompletionHour",
            value=float(peak_hour),
            unit="hour",
            confidence=conf_score,
            confidenceLabel=conf_label,
            dataPoints=completed_count,
            period=date_range
        ))

    # 2. PRODUCTIVE_DAY Pattern (Best Weekday)
    best_weekday = task_res.get("bestWeekday", "Saturday")
    patterns.append(PatternInsight(
        type="PRODUCTIVE_DAY",
        title=f"{best_weekday} is your most active completion day",
        description=f"Your highest task completion activity is recorded on {best_weekday}s.",
        metric="peakWeekday",
        value=1.0,
        unit="day",
        confidence=conf_score,
        confidenceLabel=conf_label,
        dataPoints=completed_count,
        period=date_range
    ))

    # 3. ESTIMATION_ERROR Pattern
    est_error = task_res.get("estimationErrorPercentage", 0.0)
    if abs(est_error) >= 5.0 and completed_count >= 3:
        direction = "longer" if est_error > 0 else "faster"
        patterns.append(PatternInsight(
            type="ESTIMATION_ERROR",
            title=f"Tasks take {abs(est_error)}% {direction} than estimated",
            description=f"Completed tasks take an average of {abs(est_error)}% {direction} than initially estimated.",
            metric="estimationErrorPercentage",
            value=float(est_error),
            unit="percent",
            confidence=conf_score,
            confidenceLabel=conf_label,
            dataPoints=completed_count,
            period=date_range
        ))

    # 4. POSTPONEMENT_PATTERN
    postpone_rate = task_res.get("postponementRatePercentage", 0.0)
    if postpone_rate >= 15.0:
        patterns.append(PatternInsight(
            type="POSTPONEMENT_PATTERN",
            title=f"Postponement rate is {postpone_rate}%",
            description=f"{postpone_rate}% of your recorded tasks have been postponed at least once.",
            metric="postponementRate",
            value=float(postpone_rate),
            unit="percent",
            confidence=conf_score,
            confidenceLabel=conf_label,
            dataPoints=completed_count,
            period=date_range
        ))

    # 5. CATEGORY_DELAY & Activity Analysis
    cat_analysis = task_res.get("categoryAnalysis", [])
    if cat_analysis:
        top_cat = cat_analysis[0]
        patterns.append(PatternInsight(
            type="CATEGORY_DELAY",
            title=f"Highest activity in {top_cat['category']} category",
            description=f"{top_cat['category']} tasks account for your highest workload focus ({top_cat['completedTasks']} tasks completed, {top_cat['completionRate']}% completion rate).",
            metric="categoryCompletionRate",
            value=float(top_cat['completionRate']),
            unit="percent",
            confidence=conf_score,
            confidenceLabel=conf_label,
            dataPoints=top_cat['totalTasks'],
            period=date_range
        ))

    # 6. WORKLOAD_PATTERN & Pressure Warning
    workload_pressure = workload_res.get("workloadPressure", "LOW")
    if workload_pressure == "HIGH":
        patterns.append(PatternInsight(
            type="WORKLOAD_PATTERN",
            title="High Workload Pressure Detected",
            description=f"Your planned daily workload exceeds your historical completed capacity ({workload_res.get('historicalCapacityHours', 0)} hrs/day).",
            metric="workloadRatio",
            value=float(workload_res.get('workloadPressureRatio', 100.0)),
            unit="percent",
            confidence=0.85,
            confidenceLabel="STRONG",
            dataPoints=completed_count,
            period="today"
        ))

    # 7. GOAL_PROGRESS_PATTERN
    if goal_res.get("available", False):
        velocity = goal_res.get("goalVelocity", 0.0)
        if velocity > 0:
            patterns.append(PatternInsight(
                type="GOAL_PROGRESS_PATTERN",
                title=f"Goal Velocity is +{velocity}% per day",
                description=f"Your active goals are progressing at an average velocity of +{velocity}% per day.",
                metric="goalVelocity",
                value=float(velocity),
                unit="percent_per_day",
                confidence=0.80,
                confidenceLabel="STRONG",
                dataPoints=goal_res.get("totalGoals", 0),
                period=date_range
            ))

    return patterns
