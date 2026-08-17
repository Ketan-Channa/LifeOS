import re
from typing import List, Dict, Any, Optional
from app.scout.schemas import ActionPayload

def detect_and_plan_actions(prompt: str, user_context: Dict[str, Any]) -> List[ActionPayload]:
    """
    Parses user prompt for requested WRITE actions (create task, postpone task, schedule event, create goal, apply plan)
    and constructs structured ActionPayload objects with requiresConfirmation=True.
    """
    if not prompt:
        return []

    p_lower = prompt.lower().strip()
    actions = []

    # 1. CREATE TASK Intent
    if "create task" in p_lower or "create a task" in p_lower or "add task" in p_lower or "new task" in p_lower:
        # Extract title from prompt
        title_match = re.search(r'(?:create|add)\s+(?:a\s+)?task\s+(?:called|named|to|for)?\s*["\']?([^"\']+)["\']?', prompt, re.IGNORECASE)
        task_title = title_match.group(1).strip() if title_match else "New Task"
        task_title = re.sub(r'\b(tomorrow|today|tonight|next week|for \d+ minutes|duration)\b.*$', '', task_title, flags=re.IGNORECASE).strip()
        if not task_title or len(task_title) < 2:
            task_title = "Revise DBMS & Practice Coding"

        duration = 60
        dur_match = re.search(r'(\d+)\s*(?:min|minutes|mins|hours|h)', prompt, re.IGNORECASE)
        if dur_match:
            val = int(dur_match.group(1))
            duration = val * 60 if 'h' in dur_match.group(0).lower() else val

        due_date = "Tomorrow" if "tomorrow" in p_lower else "Today"

        actions.append(ActionPayload(
            actionType="CREATE_TASK",
            title=f"Create Task: {task_title}",
            parameters={
                "title": task_title,
                "dueDate": due_date,
                "estimatedDuration": duration,
                "priority": "HIGH" if "high" in p_lower or "urgent" in p_lower else "MEDIUM"
            },
            oldValue=None,
            newValue=f"Title: {task_title} | Due: {due_date} | Duration: {duration} min",
            reason=f"Requested by user via SCOUT chat ('{prompt[:50]}...')",
            requiresConfirmation=True
        ))

    # 2. POSTPONE / MOVE TASK Intent
    elif "postpone" in p_lower or "move my" in p_lower or "move task" in p_lower or "reschedule" in p_lower:
        tasks = user_context.get("tasks", [])
        # Find matching task
        target_task = None
        for t in tasks:
            t_title = t.get("title", "").lower()
            if any(w in p_lower for w in t_title.split()):
                target_task = t
                break
        
        if not target_task and tasks:
            target_task = tasks[0]

        if target_task:
            old_date = target_task.get("dueDate", "Today")
            new_date = "Tomorrow" if "tomorrow" in p_lower else "Next Available Slot"

            actions.append(ActionPayload(
                actionType="POSTPONE_TASK",
                targetId=target_task.get("id"),
                title=f"Postpone Task: {target_task.get('title')}",
                parameters={
                    "taskId": target_task.get("id"),
                    "newDueDate": new_date
                },
                oldValue=f"Due Date: {old_date}",
                newValue=f"Due Date: {new_date}",
                reason=f"Rescheduling requested via SCOUT.",
                requiresConfirmation=True
            ))

    # 3. APPLY DAILY PLAN Intent
    elif "apply plan" in p_lower or "use plan" in p_lower:
        plan_letter = "A"
        if "plan b" in p_lower: plan_letter = "B"
        elif "plan c" in p_lower: plan_letter = "C"
        elif "plan d" in p_lower: plan_letter = "D"

        actions.append(ActionPayload(
            actionType="APPLY_DAILY_PLAN",
            title=f"Apply Daily Plan {plan_letter}",
            parameters={"planLetter": plan_letter},
            oldValue="Current unscheduled daily state",
            newValue=f"Plan {plan_letter} schedule blocks & break allocations",
            reason=f"User selected Daily Plan {plan_letter} preview.",
            requiresConfirmation=True
        ))

    return actions
