import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any
from app.analytics.schemas import TaskInput
from app.analytics.statistics import parse_iso, filter_tasks_by_date_range

def analyze_task_performance(tasks: List[TaskInput], date_range: str = 'last_30_days') -> Dict[str, Any]:
    filtered_tasks = filter_tasks_by_date_range(tasks, date_range)
    total_count = len(filtered_tasks)
    completed_tasks = [t for t in filtered_tasks if t.status == 'COMPLETED']
    completed_count = len(completed_tasks)

    # Data sufficiency rule
    if total_count < 1 or completed_count < 1:
        return {
            "available": False,
            "reason": "Insufficient task completion data. Complete at least 5 tasks to unlock detailed task telemetry.",
            "totalTasks": total_count,
            "completedTasks": completed_count
        }

    # 1. Completion & On-Time Rates
    completion_rate = round((completed_count / total_count) * 100.0, 1)

    on_time_count = 0
    delayed_count = 0
    total_delay_mins = 0

    for t in completed_tasks:
        if t.dueDate and t.completedAt:
            due_dt = parse_iso(t.dueDate)
            comp_dt = parse_iso(t.completedAt)
            if due_dt and comp_dt:
                if comp_dt <= due_dt:
                    on_time_count += 1
                else:
                    delayed_count += 1
                    total_delay_mins += (comp_dt - due_dt).total_seconds() / 60.0

    on_time_rate = round((on_time_count / completed_count) * 100.0, 1) if completed_count > 0 else 0.0
    late_rate = round((delayed_count / completed_count) * 100.0, 1) if completed_count > 0 else 0.0
    average_delay_minutes = round(total_delay_mins / delayed_count, 1) if delayed_count > 0 else 0.0

    # 2. Estimation Accuracy Analysis
    est_list = []
    act_list = []
    mape_list = []

    for t in completed_tasks:
        if t.estimatedMinutes > 0 and t.actualMinutes > 0:
            est_list.append(t.estimatedMinutes)
            act_list.append(t.actualMinutes)
            mape_list.append(abs(t.actualMinutes - t.estimatedMinutes) / t.estimatedMinutes * 100.0)

    avg_est = float(np.mean(est_list)) if est_list else 0.0
    avg_act = float(np.mean(act_list)) if act_list else 0.0
    estimation_error = round(((avg_act - avg_est) / avg_est) * 100.0, 1) if avg_est > 0 else 0.0
    mape = round(float(np.mean(mape_list)), 1) if mape_list else 0.0

    # 3. Postponement Rate
    postponed_count = sum(1 for t in filtered_tasks if t.taskHistories and any(h.action == 'POSTPONED' for h in t.taskHistories))
    postponement_rate = round((postponed_count / total_count) * 100.0, 1)

    # 4. Productivity by Hour (0-23)
    hourly_counts = {h: 0 for h in range(24)}
    for t in completed_tasks:
        if t.completedAt:
            comp_dt = parse_iso(t.completedAt)
            if comp_dt:
                hourly_counts[comp_dt.hour] += 1

    peak_hour = max(hourly_counts, key=hourly_counts.get)
    peak_hour_count = hourly_counts[peak_hour]
    productivity_by_hour = [{"hour": h, "completedTasks": count} for h, count in hourly_counts.items()]

    # 5. Productivity by Weekday (Mon-Sun)
    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday_counts = {name: 0 for name in weekday_names}
    for t in completed_tasks:
        if t.completedAt:
            comp_dt = parse_iso(t.completedAt)
            if comp_dt:
                weekday_counts[weekday_names[comp_dt.weekday()]] += 1

    best_weekday = max(weekday_counts, key=weekday_counts.get)
    productivity_by_weekday = [{"weekday": day, "completedTasks": count} for day, count in weekday_counts.items()]

    # 6. Category Performance Breakdown
    categories = list(set(t.category for t in filtered_tasks))
    category_analysis = []
    for cat in categories:
        cat_tasks = [t for t in filtered_tasks if t.category == cat]
        cat_comp = [t for t in cat_tasks if t.status == 'COMPLETED']
        cat_comp_rate = round((len(cat_comp) / len(cat_tasks)) * 100.0, 1) if cat_tasks else 0.0
        cat_postponed = sum(1 for t in cat_tasks if t.taskHistories and any(h.action == 'POSTPONED' for h in t.taskHistories))
        cat_postpone_rate = round((cat_postponed / len(cat_tasks)) * 100.0, 1) if cat_tasks else 0.0

        category_analysis.append({
            "category": cat,
            "totalTasks": len(cat_tasks),
            "completedTasks": len(cat_comp),
            "completionRate": cat_comp_rate,
            "postponementRate": cat_postpone_rate
        })

    # Sort categories by total tasks desc
    category_analysis.sort(key=lambda x: x["totalTasks"], reverse=True)

    # 7. Priority Performance Breakdown
    priority_analysis = []
    for prio in ["LOW", "MEDIUM", "HIGH", "URGENT"]:
        prio_tasks = [t for t in filtered_tasks if t.priority == prio]
        prio_comp = [t for t in prio_tasks if t.status == 'COMPLETED']
        prio_comp_rate = round((len(prio_comp) / len(prio_tasks)) * 100.0, 1) if prio_tasks else 0.0
        priority_analysis.append({
            "priority": prio,
            "totalTasks": len(prio_tasks),
            "completedTasks": len(prio_comp),
            "completionRate": prio_comp_rate
        })

    # 8. Energy Level Performance Breakdown
    energy_analysis = []
    for nrg in ["LOW", "MEDIUM", "HIGH"]:
        nrg_tasks = [t for t in filtered_tasks if t.energyLevel == nrg]
        nrg_comp = [t for t in nrg_tasks if t.status == 'COMPLETED']
        nrg_comp_rate = round((len(nrg_comp) / len(nrg_tasks)) * 100.0, 1) if nrg_tasks else 0.0
        energy_analysis.append({
            "energyLevel": nrg,
            "totalTasks": len(nrg_tasks),
            "completedTasks": len(nrg_comp),
            "completionRate": nrg_comp_rate
        })

    return {
        "available": True,
        "totalTasks": total_count,
        "completedTasks": completed_count,
        "completionRate": completion_rate,
        "onTimeRate": on_time_rate,
        "lateRate": late_rate,
        "averageDelayMinutes": average_delay_minutes,
        "averageEstimatedMinutes": round(avg_est, 1),
        "averageActualMinutes": round(avg_act, 1),
        "estimationErrorPercentage": estimation_error,
        "mape": mape,
        "postponementRatePercentage": postponement_rate,
        "peakHour": peak_hour,
        "peakHourCount": peak_hour_count,
        "bestWeekday": best_weekday,
        "productivityByHour": productivity_by_hour,
        "productivityByWeekday": productivity_by_weekday,
        "categoryAnalysis": category_analysis,
        "priorityAnalysis": priority_analysis,
        "energyAnalysis": energy_analysis
    }
