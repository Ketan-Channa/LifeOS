import copy
from typing import List, Dict, Any, Tuple
from app.planner.constraints import parse_time_to_mins, mins_to_time_str, ConstraintEngine

def sort_items_for_strategy(items: List[Dict[str, Any]], strategy_key: str) -> List[Dict[str, Any]]:
    """
    Sorts planning items according to candidate strategy.
    """
    items_copy = [dict(item) for item in items if not item.get('isFixed')]
    prio_map = {'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    energy_map = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}

    if strategy_key == 'DEADLINE_FIRST':
        # Prioritize urgent deadlines, overdue tasks, and highest ML deadline risk
        items_copy.sort(key=lambda x: (
            0 if x.get('deadline') == 'Today' else 1 if x.get('deadline') == 'Tomorrow' else 2,
            -(x.get('deadlineRisk', 0.0)),
            prio_map.get(x.get('priority', 'MEDIUM'), 2),
            int(x.get('durationMinutes', 45))
        ))
    elif strategy_key == 'FOCUS_OPTIMIZED':
        # Group high-energy deep work tasks first (longer duration deep work blocks)
        items_copy.sort(key=lambda x: (
            energy_map.get(x.get('energyLevel', 'MEDIUM'), 1),
            -(int(x.get('durationMinutes', 45))),
            prio_map.get(x.get('priority', 'MEDIUM'), 2)
        ))
    elif strategy_key == 'LOW_STRESS':
        # Interleave shorter tasks and lower energy items first to build momentum without stress
        items_copy.sort(key=lambda x: (
            energy_map.get(x.get('energyLevel', 'MEDIUM'), 1) == 0, # Low/Med first
            int(x.get('durationMinutes', 45)),
            prio_map.get(x.get('priority', 'MEDIUM'), 2)
        ))
    else: # BALANCED
        items_copy.sort(key=lambda x: (
            prio_map.get(x.get('priority', 'MEDIUM'), 2),
            0 if x.get('deadline') == 'Today' else 1,
            energy_map.get(x.get('energyLevel', 'MEDIUM'), 1)
        ))

    return items_copy

def generate_candidate_schedule(
    strategy_key: str,
    window_start_mins: int,
    window_end_mins: int,
    blocked_intervals: List[Tuple[int, int, str]],
    items: List[Dict[str, Any]],
    break_pref_mins: int = 15,
    max_workload_hours: float = None
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], int]:
    """
    Allocates sorted items into available free slots without overlapping fixed events or breaks.
    """
    sorted_items = sort_items_for_strategy(items, strategy_key)
    
    # Track current blocked intervals
    current_blocked = list(blocked_intervals)

    scheduled_blocks = []
    unscheduled_items = []
    break_count = 0
    total_workload_mins = 0
    max_workload_mins = int(max_workload_hours * 60) if max_workload_hours else 99999

    # Add fixed items to scheduled blocks first
    for idx, item in enumerate(items):
        if item.get('isFixed') or not item.get('isFlexible', True):
            pst = parse_time_to_mins(item.get('preferredStartTime'))
            dur = int(item.get('durationMinutes', 30))
            pet = pst + dur
            item_id = str(item.get('id')) if item.get('id') else f"fixed_{pst}_{idx}"
            scheduled_blocks.append({
                "id": item_id,
                "title": item.get('title'),
                "category": item.get('category', 'General'),
                "priority": item.get('priority', 'MEDIUM'),
                "energyLevel": item.get('energyLevel', 'MEDIUM'),
                "startTime": mins_to_time_str(pst),
                "endTime": mins_to_time_str(pet),
                "durationMinutes": dur,
                "isBreak": False,
                "isFixed": True,
                "linkedTaskId": item.get('linkedTaskId'),
                "linkedGoalId": item.get('linkedGoalId'),
                "deadlineRisk": item.get('deadlineRisk'),
                "reason": "Fixed event locked on schedule."
            })
            total_workload_mins += dur

    # Slot allocation helper
    def find_free_slot(duration_mins: int, start_search_from: int) -> Tuple[int, int]:
        search_curr = max(window_start_mins, start_search_from)
        while search_curr + duration_mins <= window_end_mins:
            conflict = False
            for b_start, b_end, _ in current_blocked:
                if max(search_curr, b_start) < min(search_curr + duration_mins, b_end):
                    conflict = True
                    search_curr = b_end
                    break
            if not conflict:
                return (search_curr, search_curr + duration_mins)
        return (None, None)

    # Distinct Strategy Starting Search Times & Break Insertion Rules
    if strategy_key == 'DEADLINE_FIRST':
        # Start immediately at early window start (e.g. 06:00) to clear deadlines early
        current_search_time = window_start_mins
        strategy_break = max(10, break_pref_mins)
    elif strategy_key == 'FOCUS_OPTIMIZED':
        # Group deep focus work starting in prime morning focus block (09:00 AM)
        current_search_time = max(window_start_mins, 9 * 60)
        strategy_break = 25 # Longer recovery breaks between deep focus blocks
    elif strategy_key == 'LOW_STRESS':
        # Start at 08:00 AM with generous breaks between every single task
        current_search_time = max(window_start_mins, 8 * 60)
        strategy_break = max(20, break_pref_mins)
    else: # BALANCED
        current_search_time = max(window_start_mins, 7 * 60 + 30)
        strategy_break = break_pref_mins

    for idx, item in enumerate(sorted_items):
        dur = int(item.get('durationMinutes', 45))

        # Respect max workload threshold
        if total_workload_mins + dur > max_workload_mins:
            unscheduled_items.append({
                "item": item,
                "reason": f"Exceeds maximum workload preference limit of {max_workload_hours}h."
            })
            continue

        # Preferred start time if explicitly set by user, otherwise use strategy search time
        pref_st = parse_time_to_mins(item.get('preferredStartTime')) if item.get('preferredStartTime') else current_search_time
        slot_st, slot_et = find_free_slot(dur, pref_st)

        if slot_st is None:
            # Fall back to searching from window start
            slot_st, slot_et = find_free_slot(dur, window_start_mins)

        if slot_st is not None and slot_et is not None:
            current_blocked.append((slot_st, slot_et, item.get('title')))
            current_blocked.sort(key=lambda x: x[0])

            item_id = str(item.get('id')) if item.get('id') else f"task_{slot_st}_{idx}"
            scheduled_blocks.append({
                "id": item_id,
                "title": item.get('title'),
                "category": item.get('category', 'General'),
                "priority": item.get('priority', 'MEDIUM'),
                "energyLevel": item.get('energyLevel', 'MEDIUM'),
                "startTime": mins_to_time_str(slot_st),
                "endTime": mins_to_time_str(slot_et),
                "durationMinutes": dur,
                "isBreak": False,
                "isFixed": False,
                "linkedTaskId": item.get('linkedTaskId'),
                "linkedGoalId": item.get('linkedGoalId'),
                "deadlineRisk": item.get('deadlineRisk'),
                "reason": f"Scheduled in a conflict-free window ({mins_to_time_str(slot_st)} - {mins_to_time_str(slot_et)}) using {strategy_key.replace('_', ' ').title()} strategy."
            })
            total_workload_mins += dur
            current_search_time = slot_et

            # Strategy-specific break placement
            should_add_break = (strategy_key == 'LOW_STRESS') or (strategy_key == 'FOCUS_OPTIMIZED' and item.get('energyLevel') == 'HIGH') or (idx % 2 == 1)
            
            if should_add_break and strategy_break > 0 and current_search_time + strategy_break <= window_end_mins:
                b_st, b_et = find_free_slot(strategy_break, current_search_time)
                if b_st is not None and b_st == current_search_time:
                    current_blocked.append((b_st, b_et, "Break"))
                    current_blocked.sort(key=lambda x: x[0])
                    scheduled_blocks.append({
                        "id": f"break_{b_st}_{idx}",
                        "title": "Rest & Buffer Break",
                        "category": "Rest",
                        "priority": "LOW",
                        "energyLevel": "LOW",
                        "startTime": mins_to_time_str(b_st),
                        "endTime": mins_to_time_str(b_et),
                        "durationMinutes": strategy_break,
                        "isBreak": True,
                        "isFixed": False,
                        "reason": f"Scheduled {strategy_break}-minute rest break for {strategy_key.replace('_', ' ').title()} recovery."
                    })
                    break_count += 1
                    current_search_time = b_et
        else:
            unscheduled_items.append({
                "item": item,
                "reason": "Insufficient continuous free time slot available in window."
            })

    # Sort final scheduled blocks by start time
    scheduled_blocks.sort(key=lambda x: parse_time_to_mins(x['startTime']))

    return scheduled_blocks, unscheduled_items, break_count
