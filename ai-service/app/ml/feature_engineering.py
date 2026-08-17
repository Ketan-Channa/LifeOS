import pandas as pd
import numpy as np
from typing import Dict, Any, List

def build_task_features(task: Dict[str, Any], user_tasks: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extract features for a task without data leakage.
    DO NOT use completedAt in risk inputs.
    """
    est_mins = float(task.get('estimatedMinutes', 30))
    prio = task.get('priority', 'MEDIUM')
    cat = task.get('category', 'General')
    energy = task.get('energyLevel', 'MEDIUM')

    # Days until due
    due_date_str = task.get('dueDate')
    if due_date_str:
        try:
            dt_due = pd.to_datetime(due_date_str)
            now = pd.to_datetime('now')
            days_until_due = max(0.0, float((dt_due - now).days))
            day_of_week = dt_due.day_name()
        except Exception:
            days_until_due = 3.0
            day_of_week = "Wednesday"
    else:
        days_until_due = 5.0
        day_of_week = "Wednesday"

    # Historical user category completion rate & estimation error
    if user_tasks:
        df_u = pd.DataFrame(user_tasks)
        cat_tasks = df_u[df_u['category'] == cat] if 'category' in df_u.columns else pd.DataFrame()
        if not cat_tasks.empty and 'status' in cat_tasks.columns:
            cat_comp = len(cat_tasks[cat_tasks['status'] == 'COMPLETED'])
            cat_completion_rate = float(cat_comp / len(cat_tasks))
        else:
            cat_completion_rate = 0.75
    else:
        cat_completion_rate = 0.75

    # Previous postponements count
    postponements = int(task.get('previousPostponements', task.get('postponementCount', 0)))

    return {
        "estimatedMinutes": est_mins,
        "priority": prio,
        "category": cat,
        "energyLevel": energy,
        "daysUntilDue": days_until_due,
        "dayOfWeek": day_of_week,
        "categoryCompletionRate": cat_completion_rate,
        "postponementCount": float(postponements)
    }

def build_goal_features(goal: Dict[str, Any], linked_tasks: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extract features for Goal completion risk.
    """
    prog = float(goal.get('progress', 0.0))
    prio = goal.get('priority', 'MEDIUM')
    
    target_date_str = goal.get('targetDate')
    if target_date_str:
        try:
            dt_target = pd.to_datetime(target_date_str)
            now = pd.to_datetime('now')
            days_remaining = max(1.0, float((dt_target - now).days))
        except Exception:
            days_remaining = 14.0
    else:
        days_remaining = 14.0

    rem_progress = max(0.0, 100.0 - prog)
    required_daily_progress = round(rem_progress / days_remaining, 2)

    # Linked task postponement rate
    if linked_tasks:
        df_t = pd.DataFrame(linked_tasks)
        postponed_count = len(df_t[df_t['status'] == 'POSTPONED']) if 'status' in df_t.columns else 0
        postponement_rate = float(postponed_count / len(df_t)) if len(df_t) > 0 else 0.10
    else:
        postponement_rate = 0.10

    return {
        "progress": prog,
        "daysRemaining": days_remaining,
        "requiredDailyProgress": required_daily_progress,
        "priority": prio,
        "postponementRate": postponement_rate
    }
