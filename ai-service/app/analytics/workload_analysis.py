import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.analytics.schemas import TaskInput
from app.analytics.statistics import parse_iso, filter_tasks_by_date_range

def analyze_workload(tasks: List[TaskInput], date_range: str = 'last_30_days') -> Dict[str, Any]:
    filtered_tasks = filter_tasks_by_date_range(tasks, date_range)
    total_count = len(filtered_tasks)

    if total_count < 1:
        return {
            "available": False,
            "reason": "Insufficient tasks to construct daily workload trends.",
            "workloadPressure": "LOW",
            "averageDailyWorkloadHours": 0.0,
            "historicalCapacityHours": 0.0
        }

    # Group completed workload by completion date
    daily_completed_hours: Dict[str, float] = {}
    for t in filtered_tasks:
        if t.status == 'COMPLETED' and t.completedAt:
            comp_dt = parse_iso(t.completedAt)
            if comp_dt:
                date_str = comp_dt.strftime('%Y-%m-%d')
                dur_hours = (t.actualMinutes if t.actualMinutes > 0 else t.estimatedMinutes) / 60.0
                daily_completed_hours[date_str] = daily_completed_hours.get(date_str, 0.0) + dur_hours

    # Historical average completed workload capacity (hours/day)
    completed_days_count = len(daily_completed_hours)
    historical_capacity_hours = (
        round(float(np.mean(list(daily_completed_hours.values()))), 1)
        if completed_days_count > 0 else 4.0
    )

    # Planned upcoming workload by due date
    daily_planned_hours: Dict[str, float] = {}
    now = datetime.now()
    today_str = now.strftime('%Y-%m-%d')

    for t in filtered_tasks:
        if t.status != 'COMPLETED' and t.status != 'CANCELLED' and t.dueDate:
            due_dt = parse_iso(t.dueDate)
            if due_dt:
                date_str = due_dt.strftime('%Y-%m-%d')
                dur_hours = t.estimatedMinutes / 60.0
                daily_planned_hours[date_str] = daily_planned_hours.get(date_str, 0.0) + dur_hours

    today_planned_hours = daily_planned_hours.get(today_str, 0.0)

    # Workload Pressure Determination
    # LOW: < 80% capacity | MEDIUM: 80% - 110% capacity | HIGH: > 110% capacity
    pressure = "LOW"
    ratio = (today_planned_hours / historical_capacity_hours) if historical_capacity_hours > 0 else 0.5
    if ratio > 1.1:
        pressure = "HIGH"
    elif ratio >= 0.8:
        pressure = "MEDIUM"

    # Last 7 days workload trend chart data
    chart_data = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        d_str = d.strftime('%Y-%m-%d')
        label = d.strftime('%a')
        completed_h = round(daily_completed_hours.get(d_str, 0.0), 1)
        planned_h = round(daily_planned_hours.get(d_str, 0.0), 1)

        chart_data.append({
            "date": d_str,
            "day": label,
            "completedHours": completed_h,
            "plannedHours": planned_h,
            "capacityHours": historical_capacity_hours
        })

    return {
        "available": True,
        "workloadPressure": pressure,
        "todayPlannedHours": round(today_planned_hours, 1),
        "historicalCapacityHours": historical_capacity_hours,
        "workloadPressureRatio": round(ratio * 100.0, 1),
        "dailyWorkloadTrend": chart_data
    }
