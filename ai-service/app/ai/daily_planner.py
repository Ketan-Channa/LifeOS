import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.ai.gemini_service import call_gemini_api

def parse_time_to_minutes(time_str: str) -> int:
    """Helper to convert HH:MM or ISO timestamp to minutes from midnight."""
    try:
        if 'T' in str(time_str):
            dt = datetime.fromisoformat(str(time_str).replace('Z', ''))
            return dt.hour * 60 + dt.minute
        parts = time_str.split(':')
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 540 # Default 09:00

def minutes_to_time_str(mins: int) -> str:
    """Helper to convert minutes from midnight to HH:MM format."""
    mins = max(0, min(1439, mins))
    h = mins // 60
    m = mins % 60
    return f"{h:02d}:{m:02d}"

def generate_smart_daily_plan(
    date_str: str,
    tasks: List[Dict[str, Any]],
    goals: List[Dict[str, Any]],
    schedule_events: List[Dict[str, Any]],
    habits: List[Dict[str, Any]] = [],
    analytics: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Build a smart, conflict-free daily schedule plan taking into account
    existing events, task priorities, habit preferences, and peak focus hours.
    """
    # 1. Identify existing blocked time intervals (08:00 to 22:00 default waking window)
    DAY_START_MINS = 8 * 60 # 08:00 AM
    DAY_END_MINS = 22 * 60  # 10:00 PM
    
    blocked_intervals = []
    for ev in schedule_events:
        st = ev.get('startTime')
        et = ev.get('endTime')
        if st and et:
            st_mins = parse_time_to_minutes(st)
            et_mins = parse_time_to_minutes(et)
            if et_mins > st_mins:
                blocked_intervals.append((st_mins, et_mins))
    
    # Sort blocked intervals by start time
    blocked_intervals.sort(key=lambda x: x[0])

    # 2. Extract pending tasks sorted by priority and urgency
    pending_tasks = [t for t in tasks if t.get('status') in ['TODO', 'IN_PROGRESS']]
    priority_order = {'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    pending_tasks.sort(key=lambda t: (priority_order.get(t.get('priority', 'MEDIUM'), 2), t.get('dueDate') or '9999'))

    # 3. Extract active habits
    active_habits = [h for h in habits if h.get('isActive', True)]

    # 4. Slot allocation loop
    items = []
    current_time = DAY_START_MINS
    total_scheduled_mins = 0

    # Helper function to find next free time slot of required duration
    def find_free_slot(duration_mins: int, start_search_from: int) -> tuple[int, int]:
        search_curr = max(DAY_START_MINS, start_search_from)
        while search_curr + duration_mins <= DAY_END_MINS:
            conflict = False
            for b_start, b_end in blocked_intervals:
                # Check overlap
                if max(search_curr, b_start) < min(search_curr + duration_mins, b_end):
                    conflict = True
                    search_curr = b_end + 15 # Move past blocked interval + 15 min buffer
                    break
            if not conflict:
                return (search_curr, search_curr + duration_mins)
        return (None, None)

    # Schedule active habits with preferred times first
    for h in active_habits[:3]:
        pref_time = h.get('preferredTime')
        dur = int(h.get('targetValue', 30)) if h.get('targetUnit') in ['minutes', 'mins'] else 30
        dur = min(90, max(20, dur))
        
        pref_mins = parse_time_to_minutes(pref_time) if pref_time else current_time
        slot_st, slot_et = find_free_slot(dur, pref_mins)
        
        if slot_st is not None and slot_et is not None:
            blocked_intervals.append((slot_st, slot_et))
            blocked_intervals.sort(key=lambda x: x[0])
            
            items.append({
                "title": f"Habit: {h.get('name')}",
                "category": h.get('category', 'Personal'),
                "priority": h.get('priority', 'HIGH'),
                "startTime": minutes_to_time_str(slot_st),
                "endTime": minutes_to_time_str(slot_et),
                "durationMinutes": dur,
                "relatedTaskId": None,
                "relatedGoalId": h.get('goalId'),
                "reason": f"Aligned with your preferred habit window ({h.get('preferredTime', 'scheduled window')}) to sustain current streak of {h.get('currentStreak', 0)} days."
            })
            total_scheduled_mins += dur

    # Schedule top pending tasks
    for t in pending_tasks[:6]:
        dur = int(t.get('estimatedMinutes', 45))
        dur = min(120, max(20, dur))
        
        # Schedule high/urgent tasks earlier in the day
        pref_start = current_time
        if t.get('priority') in ['URGENT', 'HIGH']:
            pref_start = DAY_START_MINS + 60 # 09:00 AM peak focus
            
        slot_st, slot_et = find_free_slot(dur, pref_start)
        if slot_st is None: # Fall back to searching from morning
            slot_st, slot_et = find_free_slot(dur, DAY_START_MINS)
            
        if slot_st is not None and slot_et is not None:
            blocked_intervals.append((slot_st, slot_et))
            blocked_intervals.sort(key=lambda x: x[0])
            
            cat = t.get('category', 'Project')
            prio = t.get('priority', 'MEDIUM')
            
            items.append({
                "title": t.get('title'),
                "category": cat,
                "priority": prio,
                "startTime": minutes_to_time_str(slot_st),
                "endTime": minutes_to_time_str(slot_et),
                "durationMinutes": dur,
                "relatedTaskId": t.get('id'),
                "relatedGoalId": t.get('goalId'),
                "reason": f"Scheduled in a conflict-free focus window ({minutes_to_time_str(slot_st)} - {minutes_to_time_str(slot_et)}) matching task priority {prio} and {cat} domain."
            })
            total_scheduled_mins += dur
            current_time = slot_et + 15 # 15 min buffer

    # Calculate free hours remaining in 14-hour waking day (08:00 to 22:00 = 840 mins)
    free_mins = max(0, 840 - total_scheduled_mins - sum(et - st for st, et in blocked_intervals if st >= DAY_START_MINS and et <= DAY_END_MINS))
    scheduled_hours = round(total_scheduled_mins / 60.0, 1)
    free_hours = round(free_mins / 60.0, 1)

    # Sort schedule items by start time
    items.sort(key=lambda x: x['startTime'])

    # 5. Generate Gemini AI Reasoning Synthesis
    gemini_prompt = f"""
Analyze the following proposed daily schedule for user date {date_str} and summarize why this plan is optimal in 2-3 inspiring sentences.

Proposed Schedule Items:
{json.dumps(items, indent=2)}

Total Scheduled Hours: {scheduled_hours}h
Free Hours Remaining: {free_hours}h
"""
    ai_reasoning = call_gemini_api(gemini_prompt)
    if not ai_reasoning:
        ai_reasoning = f"Generated a conflict-free daily plan for {date_str} featuring {len(items)} high-impact tasks and routine habits ({scheduled_hours} hours total). Priority tasks are assigned to peak focus hours with 15-minute buffer breaks."

    return {
        "available": True,
        "date": date_str,
        "totalScheduledHours": scheduled_hours,
        "freeHoursRemaining": free_hours,
        "scheduleItems": items,
        "reasoning": ai_reasoning
    }
