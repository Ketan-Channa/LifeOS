# LifeOS Phase 11 — Full Autonomous AI Agent Engine Architecture

## 1. Core Agent Loop Overview

```
                         USER
                           │
                           ↓
                      SCOUT AI
                           │
                           ↓
                     OBJECTIVE
                           │
                           ↓
                    AGENT ENGINE
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       OBSERVE           PLAN            MEMORY
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                     TOOL SELECTOR
                           │
          ┌────────────────┼─────────────────┐
          ↓                ↓                 ↓
       TASKS             GOALS             SCHEDULE
          ↓                ↓                 ↓
       HABITS           ANALYTICS            ML
          │                │                 │
          └────────────────┼─────────────────┘
                           ↓
                         RAG
                           ↓
                    CONTEXT BUILDER
                           ↓
                        GEMINI
                           ↓
                    ACTION PROPOSAL
                           ↓
                    PERMISSION CHECK
                           ↓
                 ┌─────────┴─────────┐
                 ↓                   ↓
             NO ACTION          USER APPROVAL
                 │                   │
                 │                   ↓
                 │              EXECUTE TOOL
                 │                   │
                 │                   ↓
                 │               VERIFY
                 │                   │
                 └──────────┬────────┘
                            ↓
                        EVALUATE
                            ↓
                   OBJECTIVE COMPLETE?
                       │          │
                      NO         YES
                       │          │
                       ↓          ↓
                    ADAPT      COMPLETE
                       │
                       ↓
                    NEXT STEP
```

---

## 2. Agent State Machine (`agent_state.py` & `schema.prisma`)

The agent engine operates on an explicit `AgentState` object:
- **State Fields**: `sessionId`, `userId`, `objective`, `intent`, `status`, `currentStep`, `plan`, `subgoals`, `completedSteps`, `pendingSteps`, `toolResults`, `observations`, `errors`, `requiresApproval`, `approvalRequest`, `autonomyLevel`, `createdAt`, `updatedAt`.
- **Statuses**:
  - `IDLE`: Initial state.
  - `UNDERSTANDING`: Intent classification & objective decomposition.
  - `OBSERVING`: Task-specific environment state retrieval.
  - `PLANNING`: Multi-step plan generation.
  - `WAITING_FOR_APPROVAL`: Paused awaiting explicit user confirmation card.
  - `EXECUTING`: Executing safe tool calls.
  - `EVALUATING`: Evaluating step outputs & adapting.
  - `COMPLETED`: Objective fully satisfied and verified.
  - `FAILED`: Halted safely due to constraint error or step limit.
  - `CANCELLED`: Stopped by user request.

---

## 3. Objective Decomposition & Subgoal Tracking (`goal_manager.py`)

Complex objectives are decomposed into sequential subgoals:
- **"Optimize Tomorrow"**:
  1. Inspect schedule & task workload
  2. Calculate ML deadline risks & capacity
  3. Generate & score candidate daily plans
  4. Request user plan approval
  5. Apply plan & verify schedule application
- **"Placement Readiness Roadmap"**:
  1. Inspect active placement goals & milestones
  2. Query RAG knowledge base for technical skills
  3. Identify skill gaps & preparation priorities
  4. Prepare study focus blocks & draft tasks
  5. Schedule focus blocks & verify application
- **"Weekly Life Review"**:
  1. Gather 7-day productivity telemetry
  2. Evaluate habit consistency & ML accuracy
  3. Identify wins & workload patterns
  4. Formulate actionable weekly recommendations

---

## 4. Safety, Security & Prompt Injection Defense

1. **Human-in-the-Loop Approval (`AgentApprovalCenter.tsx`)**: All WRITE/MODIFY/POSTPONE/SCHEDULE actions require explicit user confirmation unless pre-approved.
2. **Prompt Injection Defense (`executor.py`)**: Sanitizes external document text, notes, and task descriptions. External content is treated strictly as data rather than instructions.
3. **No Private Chain-of-Thought**: Private LLM reasoning is stripped. Only concise action summaries, tool calls, and decisions are rendered.
4. **Revalidation & Idempotency**: Prior to executing an action, the backend revalidates resource existence and schedule availability.
5. **Reversible Action Rollback**: Supports undo for schedule and task movements (`POST /api/agent/actions/:id/undo`).
6. **Strict Exclusions**: Destructive operations (unconfirmed data deletions, payment alterations, password changes, unrestricted SQL, or arbitrary shell execution) are **PERMANENTLY PROHIBITED**.
