from typing import List, Dict, Any, Tuple

def parse_time_to_mins(t_str: str) -> int:
    """Convert HH:MM or ISO timestamp to minutes from midnight."""
    if not t_str:
        return 0
    try:
        if 'T' in str(t_str):
            t_part = str(t_str).split('T')[1][:5]
            parts = t_part.split(':')
            return int(parts[0]) * 60 + int(parts[1])
        parts = str(t_str).split(':')
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def mins_to_time_str(mins: int) -> str:
    """Convert minutes from midnight to HH:MM format."""
    mins = max(0, min(1439, mins))
    h = mins // 60
    m = mins % 60
    return f"{h:02d}:{m:02d}"

class ConstraintEngine:
    """
    Evaluates hard constraints, fixed blocked time intervals,
    and dependency graphs.
    """

    @staticmethod
    def get_blocked_intervals(
        window_start_mins: int,
        window_end_mins: int,
        existing_events: List[Dict[str, Any]],
        input_items: List[Dict[str, Any]]
    ) -> List[Tuple[int, int, str]]:
        """
        Extracts all fixed events as blocked intervals (start_min, end_min, title).
        Fixed events must NEVER be moved.
        """
        blocked = []

        # 1. Existing fixed schedule events
        for ev in existing_events:
            st = parse_time_to_mins(ev.get('startTime'))
            et = parse_time_to_mins(ev.get('endTime'))
            if et > st and max(st, window_start_mins) < min(et, window_end_mins):
                blocked.append((st, et, ev.get('title', 'Fixed Event')))

        # 2. Input items explicitly marked as fixed
        for item in input_items:
            if item.get('isFixed') or not item.get('isFlexible', True):
                pst = parse_time_to_mins(item.get('preferredStartTime'))
                dur = int(item.get('durationMinutes', 30))
                pet = parse_time_to_mins(item.get('preferredEndTime')) if item.get('preferredEndTime') else pst + dur
                if pet > pst:
                    blocked.append((pst, pet, item.get('title', 'Fixed Item')))

        # Sort blocked intervals by start time
        blocked.sort(key=lambda x: x[0])
        return blocked

    @staticmethod
    def get_available_slots(
        window_start_mins: int,
        window_end_mins: int,
        blocked_intervals: List[Tuple[int, int, str]]
    ) -> List[Tuple[int, int]]:
        """
        Calculates open, unblocked free time slots within the window bounds.
        """
        slots = []
        curr = window_start_mins

        for b_start, b_end, _ in blocked_intervals:
            if b_start > curr and curr < window_end_mins:
                slot_end = min(b_start, window_end_mins)
                if slot_end - curr >= 15: # At least 15 mins
                    slots.append((curr, slot_end))
            curr = max(curr, b_end)

        if curr < window_end_mins:
            slots.append((curr, window_end_mins))

        return slots

    @staticmethod
    def calculate_capacity(
        window_start_mins: int,
        window_end_mins: int,
        blocked_intervals: List[Tuple[int, int, str]],
        input_items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates total available free minutes vs required workload minutes.
        """
        total_window_mins = max(0, window_end_mins - window_start_mins)
        blocked_mins = 0
        for b_st, b_et, _ in blocked_intervals:
            clamped_st = max(b_st, window_start_mins)
            clamped_et = min(b_et, window_end_mins)
            if clamped_et > clamped_st:
                blocked_mins += (clamped_et - clamped_st)

        available_mins = max(0, total_window_mins - blocked_mins)

        required_mins = 0
        for item in input_items:
            if not item.get('isFixed'):
                required_mins += int(item.get('durationMinutes', 30))

        is_overloaded = required_mins > available_mins
        overload_msg = None
        if is_overloaded:
            diff_mins = required_mins - available_mins
            overload_msg = f"⚠ OVERLOADED DAY: You have {required_mins} minutes of requested tasks but only {available_mins} free minutes available (Overload: +{diff_mins} mins)."

        return {
            "totalWindowMinutes": total_window_mins,
            "blockedMinutes": blocked_mins,
            "availableMinutes": available_mins,
            "requiredMinutes": required_mins,
            "isOverloaded": is_overloaded,
            "overloadMessage": overload_msg
        }
