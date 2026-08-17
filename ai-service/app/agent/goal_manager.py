from typing import List, Dict, Any
from app.agent.schemas import SubGoalSpec

def decompose_objective(objective: str, intent: str) -> List[SubGoalSpec]:
    """
    Decomposes complex, high-level objectives into structured, sequential subgoals.
    """
    obj_lower = objective.lower().strip()

    # 1. Daily Planning / Optimization Objective
    if "plan" in obj_lower or "optimize" in obj_lower or "tomorrow" in obj_lower:
        return [
            SubGoalSpec(id="sg_1", title="Inspect schedule & task workload", description="Retrieve tomorrow's schedule, pending tasks, and fixed events."),
            SubGoalSpec(id="sg_2", title="Calculate ML deadline risks & capacity", description="Evaluate workload pressure and deadline failure risks."),
            SubGoalSpec(id="sg_3", title="Generate & score candidate daily plans", description="Generate 4 candidate planning combinations."),
            SubGoalSpec(id="sg_4", title="Request user plan approval", description="Present recommended plan and await explicit user confirmation."),
            SubGoalSpec(id="sg_5", title="Apply plan & verify schedule application", description="Apply approved schedule blocks and revalidate zero conflicts.")
        ]

    # 2. Placement Readiness Objective
    elif "placement" in obj_lower or "interview" in obj_lower or "career" in obj_lower:
        return [
            SubGoalSpec(id="sg_1", title="Inspect active placement goals & milestones", description="Check target dates and milestone progress."),
            SubGoalSpec(id="sg_2", title="Query RAG knowledge base for technical skills", description="Search resume/syllabus documents for gap analysis."),
            SubGoalSpec(id="sg_3", title="Identify skill gaps & preparation priorities", description="Cross-reference current tasks against placement requirements."),
            SubGoalSpec(id="sg_4", title="Prepare study focus blocks & draft tasks", description="Draft study tasks for approval."),
            SubGoalSpec(id="sg_5", title="Schedule focus blocks & verify application", description="Schedule approved study tasks into focus slots.")
        ]

    # 3. Weekly Life Review Objective
    elif "weekly" in obj_lower or "review" in obj_lower:
        return [
            SubGoalSpec(id="sg_1", title="Gather 7-day productivity telemetry", description="Aggregate completion rates, focus time, and postponement counts."),
            SubGoalSpec(id="sg_2", title="Evaluate habit consistency & ML accuracy", description="Analyze habit streaks and ML risk calibration."),
            SubGoalSpec(id="sg_3", title="Identify wins & workload patterns", description="Highlight peak productive hours and delay bottlenecks."),
            SubGoalSpec(id="sg_4", title="Formulate actionable weekly recommendations", description="Propose workload adjustments and focus block caps.")
        ]

    # Default 3-step general objective breakdown
    return [
        SubGoalSpec(id="sg_1", title="Observe LifeOS telemetry", description="Retrieve current tasks, schedule, and goals."),
        SubGoalSpec(id="sg_2", title="Formulate plan & recommendations", description="Evaluate constraints and formulate optimal next steps."),
        SubGoalSpec(id="sg_3", title="Execute approved actions & verify", description="Execute safe actions upon user approval.")
    ]
