from typing import List, Dict, Any, Tuple
from app.planner.constraints import parse_time_to_mins

def validate_candidate_plan(
    scheduled_blocks: List[Dict[str, Any]],
    window_start_mins: int,
    window_end_mins: int
) -> Tuple[bool, List[str]]:
    """
    Validates candidate plan against hard constraints.
    Returns (is_valid, list_of_errors).
    """
    errors = []

    # Sort blocks by start time
    blocks_sorted = sorted(scheduled_blocks, key=lambda x: parse_time_to_mins(x.get('startTime')))

    for i in range(len(blocks_sorted)):
        b = blocks_sorted[i]
        st = parse_time_to_mins(b.get('startTime'))
        et = parse_time_to_mins(b.get('endTime'))
        title = b.get('title', 'Event')

        # 1. Non-negative duration
        if et <= st:
            errors.append(f"Invalid duration for '{title}': End time ({b.get('endTime')}) must be strictly after start time ({b.get('startTime')}).")

        # 2. Window bounds check
        if st < window_start_mins or et > window_end_mins:
            errors.append(f"Window bounds violation for '{title}': Scheduled ({b.get('startTime')} - {b.get('endTime')}) outside window bounds.")

        # 3. Overlap check with previous block
        if i > 0:
            prev_b = blocks_sorted[i - 1]
            prev_et = parse_time_to_mins(prev_b.get('endTime'))
            prev_title = prev_b.get('title', 'Event')

            if st < prev_et:
                errors.append(f"Schedule overlap: '{title}' ({b.get('startTime')}) conflicts with '{prev_title}' (ends at {prev_b.get('endTime')}).")

    return len(errors) == 0, errors
