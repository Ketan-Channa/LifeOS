import numpy as np
from datetime import datetime
from typing import List, Dict, Any
from app.analytics.schemas import GoalInput
from app.analytics.statistics import parse_iso

def analyze_goals(goals: List[GoalInput]) -> Dict[str, Any]:
    total_goals = len(goals)
    if total_goals < 1:
        return {
            "available": False,
            "reason": "No goals created yet. Create goals and milestones to unlock goal analytics.",
            "totalGoals": 0,
            "averageProgress": 0.0,
            "goalVelocity": 0.0
        }

    now = datetime.now()
    active_goals = [g for g in goals if g.status == 'ACTIVE']
    completed_goals = [g for g in goals if g.status == 'COMPLETED']
    paused_goals = [g for g in goals if g.status == 'PAUSED']

    overdue_goals = [
        g for g in goals
        if g.targetDate and parse_iso(g.targetDate) and parse_iso(g.targetDate) < now and g.status not in ['COMPLETED', 'ARCHIVED']
    ]

    avg_progress = round(float(np.mean([g.progress for g in goals])), 1)

    # Milestones telemetry
    total_milestones = 0
    completed_milestones = 0
    for g in goals:
        if g.milestones:
            total_milestones += len(g.milestones)
            completed_milestones += sum(1 for m in g.milestones if m.completed)

    milestone_rate = round((completed_milestones / total_milestones) * 100.0, 1) if total_milestones > 0 else 0.0

    # Goal velocity (% progress per day elapsed)
    velocities = []
    for g in goals:
        start_dt = parse_iso(g.startDate) if g.startDate else parse_iso(g.createdAt)
        if start_dt:
            elapsed_days = max(1, (now - start_dt).days)
            velocities.append(g.progress / elapsed_days)

    avg_velocity = round(float(np.mean(velocities)), 1) if velocities else 0.0

    # Per goal breakdown with risk estimation
    goal_breakdown = []
    for g in goals:
        target_dt = parse_iso(g.targetDate) if g.targetDate else None
        start_dt = parse_iso(g.startDate) if g.startDate else parse_iso(g.createdAt)
        days_remaining = (target_dt - now).days if target_dt else 0
        is_overdue = target_dt and target_dt < now and g.status not in ['COMPLETED', 'ARCHIVED']

        risk = "LOW"
        if is_overdue:
            risk = "HIGH"
        elif target_dt and days_remaining <= 7 and g.progress < 50:
            risk = "HIGH"
        elif target_dt and days_remaining <= 14 and g.progress < 40:
            risk = "MEDIUM"

        goal_breakdown.append({
            "id": g.id,
            "title": g.title,
            "category": g.category,
            "priority": g.priority,
            "progress": g.progress,
            "status": g.status,
            "daysRemaining": days_remaining,
            "isOverdue": is_overdue,
            "risk": risk,
            "milestoneCount": len(g.milestones) if g.milestones else 0,
            "completedMilestones": sum(1 for m in g.milestones if m.completed) if g.milestones else 0
        })

    return {
        "available": True,
        "totalGoals": total_goals,
        "activeGoals": len(active_goals),
        "completedGoals": len(completed_goals),
        "pausedGoals": len(paused_goals),
        "overdueGoals": len(overdue_goals),
        "averageProgress": avg_progress,
        "milestonesTotal": total_milestones,
        "milestonesCompleted": completed_milestones,
        "milestoneCompletionRate": milestone_rate,
        "goalVelocity": avg_velocity,
        "goals": goal_breakdown
    }
