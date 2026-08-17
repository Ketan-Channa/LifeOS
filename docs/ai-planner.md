# LifeOS AI Plan My Day 2.0 — Technical Documentation

## 1. Architecture Overview

```
USER SELECTION (Date, Planning Window, Max Workload, Breaks, Event Builder)
        ↓
EXPRESS BACKEND (Query Tasks, Goals, Deadlines, Fixed Schedule Events, Habits, ML Predictions)
        ↓
PYTHON PLANNER ENGINE (/ai-service/app/planner/)
        ↓
[CONSTRAINT ENGINE & FREE SLOT DETECTOR] ──→ [CAPACITY & OVERLOAD CHECK]
        ↓
CANDIDATE GENERATOR (Strategy A: Balanced, B: Deadline, C: Focus, D: Low Stress)
        ↓
PLAN SCORER (Deadline, Priority, Schedule Fit, Workload Balance, Goal Alignment, Risk Reduction)
        ↓
STRICT VALIDATOR (No Overlaps, No Fixed Conflicts, Respect Window, Respect Breaks)
        ↓
GEMINI REASONING & "WHY THIS PLAN?" SYNTHESIS
        ↓
FRONTEND COMPARISON UI (Side-by-Side Cards, Score Breakdown, Timeline, Unscheduled Items)
        ↓
USER ACTIONS: [APPLY PLAN] | [EDIT PLAN] | [DOWNLOAD PDF] | [DISCARD]
        ↓
CONFIRMATION & PRISMA `AIPlanHistory` RECORD + SCHEDULE/TASK DB SYNC
```

---

## 2. Input Parameters

- `date`: Target planning date (`YYYY-MM-DD`).
- `windowStart`: Start time bound (default: `06:00`).
- `windowEnd`: End time bound (default: `23:00`).
- `planningStyle`: Strategy preference (`BALANCED`, `DEADLINE_FIRST`, `FOCUS_OPTIMIZED`, `ENERGY_OPTIMIZED`, `MINIMUM_STRESS`).
- `maxWorkloadHours`: Optional capacity ceiling in hours (e.g. `8.0`).
- `breakPreferenceMinutes`: Automatic break interval (0, 15, 30 mins).
- `items`: Multi-event input list with attributes:
  - `title`, `durationMinutes`, `priority`, `category`, `energyLevel`, `deadline`, `preferredStartTime`, `preferredEndTime`, `isFixed`, `isFlexible`, `linkedTaskId`, `linkedGoalId`, `dependencyIds`, `breakAfter`.

---

## 3. Planning Strategies

1. **Plan A — Balanced**:
   - Optimizes priority, deadline urgency, workload distribution, and focus windows.
2. **Plan B — Deadline First**:
   - Prioritizes imminent deadlines, overdue items, and high ML deadline risk tasks.
3. **Plan C — Focus Optimized**:
   - Groups high-energy deep work tasks in peak recorded completion hours (e.g., 18:00 - 21:00 or morning) to minimize context switching.
4. **Plan D — Low Stress**:
   - Distributes workload evenly, interleaves 15-minute rest breaks, and avoids back-to-back high-energy blocks.

---

## 4. Deterministic Plan Scoring (0 - 100)

- **Deadline Handling (25%)**: Percentage of urgent/today deadline items scheduled.
- **Priority Handling (20%)**: Percentage of URGENT and HIGH priority items scheduled cleanly.
- **Schedule Fit (20%)**: Absence of conflicts and fit within planning window.
- **Workload Balance (15%)**: Workload ratio relative to 8-hour benchmark.
- **Goal Alignment (10%)**: Ingestion of tasks linked to active goals.
- **Risk Reduction (10%)**: Placement of high ML deadline risk items in earlier focus slots.

---

## 5. ReportLab PDF Export

- PDF generated server-side using Python `reportlab`.
- Filename format: `LifeOS_AI_Plan_YYYY-MM-DD.pdf`.
- Contains selectable vector text, header score banner, timeline scheduling table, and reasoning telemetry.

---

## 6. SCOUT Integration & Security

- SCOUT responds to "Plan my day" prompts by summarizing candidates.
- **Explicit Approval Guarantee**: The AI never modifies database records automatically. Database updates require explicit user confirmation.
