from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from app.analytics.schemas import TaskInput, GoalInput, ProductivityScoreResponse, ProductivityScoreComponents

def parse_iso(dt_str: str) -> datetime:
    if not dt_str:
        return None
    try:
        clean_str = dt_str.replace('Z', '+00:00')
        dt = datetime.fromisoformat(clean_str)
        return dt.replace(tzinfo=None)
    except Exception:
        return None

def filter_tasks_by_date_range(tasks: List[TaskInput], date_range: str) -> List[TaskInput]:
    if date_range == 'all_time':
        return tasks
    
    days_map = {
        'last_7_days': 7,
        'last_14_days': 14,
        'last_30_days': 30,
        'last_90_days': 90
    }
    days = days_map.get(date_range, 30)
    cutoff = datetime.now() - timedelta(days=days)

    filtered = []
    for t in tasks:
        created = parse_iso(t.createdAt)
        completed = parse_iso(t.completedAt) if t.completedAt else None
        
        if (created and created >= cutoff) or (completed and completed >= cutoff):
            filtered.append(t)
    return filtered

def calculate_productivity_score(tasks: List[TaskInput], goals: List[GoalInput]) -> ProductivityScoreResponse:
    total_tasks = len(tasks)
    completed_tasks = [t for t in tasks if t.status == 'COMPLETED']
    completed_count = len(completed_tasks)

    # Data sufficiency rule
    if total_tasks < 1 or completed_count < 1:
        return ProductivityScoreResponse(
            available=False,
            reason="Insufficient historical task activity to calculate Productivity Score.",
            score=0,
            components=ProductivityScoreComponents(),
            trend="STABLE",
            trendChangePoints=0.0,
            dataPoints=completed_count
        )

    # 1. Completion Rate Score (35% weight)
    completion_rate = (completed_count / total_tasks) * 100.0

    # 2. On-Time Completion Rate Score (25% weight)
    on_time_count = 0
    tasks_with_due = 0
    for t in completed_tasks:
        if t.dueDate and t.completedAt:
            tasks_with_due += 1
            due_dt = parse_iso(t.dueDate)
            comp_dt = parse_iso(t.completedAt)
            if due_dt and comp_dt and comp_dt <= due_dt:
                on_time_count += 1

    on_time_rate = (on_time_count / tasks_with_due * 100.0) if tasks_with_due > 0 else 80.0

    # 3. Estimation Accuracy Score (20% weight)
    est_acc_scores = []
    for t in completed_tasks:
        if t.estimatedMinutes > 0 and t.actualMinutes > 0:
            err = abs(t.actualMinutes - t.estimatedMinutes) / t.estimatedMinutes
            acc = max(0.0, 100.0 - (err * 100.0))
            est_acc_scores.append(acc)

    estimation_accuracy = float(np.mean(est_acc_scores)) if est_acc_scores else 75.0

    # 4. Goal Progress Score (20% weight)
    goal_progress = float(np.mean([g.progress for g in goals])) if goals else 50.0

    # Weighted Composite Score Calculation
    raw_score = (
        0.35 * completion_rate +
        0.25 * on_time_rate +
        0.20 * estimation_accuracy +
        0.20 * goal_progress
    )
    final_score = int(round(max(0.0, min(100.0, raw_score))))

    # Trend calculation (comparing last 7 days vs previous 7 days)
    now = datetime.now()
    recent_cutoff = now - timedelta(days=7)
    prev_cutoff = now - timedelta(days=14)

    recent_completed = [t for t in completed_tasks if parse_iso(t.completedAt) and parse_iso(t.completedAt) >= recent_cutoff]
    prev_completed = [t for t in completed_tasks if parse_iso(t.completedAt) and prev_cutoff <= parse_iso(t.completedAt) < recent_cutoff]

    trend = "STABLE"
    trend_change = 0.0

    if len(recent_completed) >= 2 and len(prev_completed) >= 2:
        recent_on_time = sum(1 for t in recent_completed if t.dueDate and t.completedAt and parse_iso(t.completedAt) <= parse_iso(t.dueDate))
        recent_on_time_pct = (recent_on_time / len(recent_completed)) * 100.0

        prev_on_time = sum(1 for t in prev_completed if t.dueDate and t.completedAt and parse_iso(t.completedAt) <= parse_iso(t.dueDate))
        prev_on_time_pct = (prev_on_time / len(prev_completed)) * 100.0

        trend_change = round(recent_on_time_pct - prev_on_time_pct, 1)
        if trend_change >= 3.0:
            trend = "IMPROVING"
        elif trend_change <= -3.0:
            trend = "DECLINING"

    return ProductivityScoreResponse(
        available=True,
        score=final_score,
        components=ProductivityScoreComponents(
            completionRate=round(completion_rate, 1),
            onTimeRate=round(on_time_rate, 1),
            estimationAccuracy=round(estimation_accuracy, 1),
            goalProgress=round(goal_progress, 1)
        ),
        trend=trend,
        trendChangePoints=trend_change,
        dataPoints=completed_count
    )
