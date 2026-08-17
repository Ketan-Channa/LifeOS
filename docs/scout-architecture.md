# LifeOS Phase 10 — SCOUT AI Unified Personal Life Intelligence Agent

## 1. Core Architecture Overview

```
                          USER
                            │
                            ↓
                  SCOUT COMMAND CENTER
                            │
                            ↓
                      INTENT ROUTER
                            │
     ┌──────────────────────┼──────────────────────┐
     ↓                      ↓                      ↓
  RETRIEVE               ANALYZE                 ACTION
     │                      │                      │
     ↓                      ↓                      ↓
  LIFEOS                ML / RAG               READ/WRITE
   DATA                  ENGINE                  TOOLS
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            ↓
                     CONTEXT BUILDER
                            ↓
                          GEMINI
                            ↓
                   STRUCTURED RESPONSE
                            │
         ┌──────────────────┴──────────────────┐
         ↓                                     ↓
    INFORMATION                              ACTION
         │                                     │
         ↓                                     ↓
  SOURCE BADGES                         CONFIRMATION CARD
                                               │
                                               ↓
                                          REVALIDATION
                                               │
                                               ↓
                                        TOOL EXECUTION
```

---

## 2. Controlled Tool Architecture (`tool_registry.py` & `tool.service.ts`)

SCOUT **MUST NOT** directly manipulate the database through unrestricted AI-generated SQL. Instead, SCOUT utilizes a controlled Tool Registry:

### READ Tools (Automatic Execution)
1. `getTasks` — Retrieve pending or overdue tasks.
2. `getTask` — Details of a specific task.
3. `getTaskStats` — Task completion rate & estimation error percentages.
4. `getTaskRisk` — ML deadline failure risk.
5. `getGoals` — Active goals & milestones.
6. `getGoalRisk` — Goal completion risk calculation.
7. `getSchedule` — Scheduled events & time blocks.
8. `getTodaySchedule` — Today's schedule & free windows.
9. `getHabits` — Habit trackers & completion streaks.
10. `getHabitStats` — Habit consistency & routine scores.
11. `getAnalytics` — Productivity score & statistical telemetry.
12. `getBehaviorPatterns` — Peak focus hours & delay patterns.
13. `getProductivityForecast` — 7-day ML productivity forecast.
14. `getWorkloadRisk` — Capacity vs workload overload check.
15. `planDay` — AI Plan My Day 2.0 multi-plan generation.
16. `searchKnowledge` — Top-K vector search over RAG documents.
17. `getDocument` — Document metadata & RAG chunks.

### WRITE Tools (Requires Explicit UI Confirmation)
1. `createTask` — Create a new task.
2. `updateTask` — Update task fields.
3. `completeTask` — Mark task as completed.
4. `postponeTask` — Move task due date.
5. `createScheduleEvent` — Create fixed schedule block.
6. `updateScheduleEvent` — Modify schedule block bounds.
7. `createGoal` — Create strategic goal.

---

## 3. Action Safety & Revalidation (`action.service.ts`)

- **Explicit Confirmation Cards (`ScoutActionPreview.tsx`)**: Proposed WRITE actions are rendered as visual confirmation cards displaying target item, old value, proposed new value, reason, `[CONFIRM]`, and `[CANCEL]`.
- **Constraint Revalidation**: Immediately prior to executing an action, the backend revalidates resource existence and checks for newly created schedule conflicts. If a conflict occurs, execution is aborted with a clear error message.
- **Idempotency Protection**: Action IDs prevent double-click duplicate executions.

---

## 4. Bounded Context & Memory Management (`context_builder.py` & `memory_manager.py`)

- **Context Budget**: Limits context to directly relevant data, current data, high-risk items, and user timezone.
- **Bounded History**: Keeps last 4-6 turns and summarizes older turns.

---

## 5. SCOUT Endpoints (`scout.routes.ts` & `routes/scout.py`)
- `POST /api/scout/chat` — Unified natural language SCOUT chat.
- `GET /api/scout/conversations` — User conversation history.
- `POST /api/scout/actions/:id/confirm` — Revalidates & executes confirmed action.
- `POST /api/scout/actions/:id/cancel` — Cancels proposed action.
- `GET /api/scout/briefing` — SCOUT Daily Briefing.
- `GET /api/scout/weekly-review` — SCOUT Weekly Review.
