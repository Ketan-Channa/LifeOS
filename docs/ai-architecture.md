# LifeOS AI Intelligence Layer Architecture

## 1. Architectural Philosophy
LifeOS AI transforms raw productivity telemetry and personal knowledge documents into an actionable, unified life co-pilot:

```
TASKS + GOALS + HABITS + SCHEDULE + ANALYTICS + ML PREDICTIONS + RAG
                                   ↓
                     SCOUT UNIFIED INTENT ROUTER
                                   ↓
              CONTROLLED TOOL REGISTRY (17 Read / 7 Write)
                                   ↓
                GOOGLE GEMINI 1.5 API (Reasoning Engine)
                                   ↓
         STRUCTURED RESPONSE + SOURCE CITATIONS + ACTION CARDS
                                   ↓
                     EXPLICIT USER CONFIRMATION
                                   ↓
                   REVALIDATION & TOOL EXECUTION
```

---

## 2. Python AI Context Builder (`/ai-service/app/scout/context_builder.py`)
Prepares structured JSON payloads representing user state with strict context budgets:
- Task Completion & Overdue Summary
- Goal Progress & Target Velocity
- Active Habits & Streak Telemetry
- Routine Score & Peak Habit Completion Hours
- Peak Recorded Productive Hours (Phase 5 statistical engine)
- Workload Capacity & Pressure Classification (`LOW`, `MEDIUM`, `HIGH`)
- ML Predictions & Failure Risk Scores (Phase 8 ML engine)

---

## 3. RAG Personal Knowledge Base (`/ai-service/app/rag/`)
- Supports PDF, DOCX, TXT, and Markdown (`MD`) documents up to 10 MB per file.
- Paragraph-aware text chunking with 500-character blocks and 50-character sliding overlap.
- Dense vector embeddings using `sentence-transformers` (`all-MiniLM-L6-v2`).
- In-memory vector store with mandatory `userId` scoping for 100% strict user isolation.
- Grounded QA enforcing NO-EVIDENCE fallback ("I couldn't find enough information...").
- Explicit source citations (`Resume.pdf — Page 2, Technical Skills`).

---

## 4. SCOUT AI Unified Agent (`/ai-service/app/scout/`)
- **Intent Classifier**: Classifies prompts into 11 categories (`TASK_QUERY`, `GOAL_QUERY`, `SCHEDULE_QUERY`, `HABIT_QUERY`, `ANALYTICS_QUERY`, `ML_QUERY`, `PLANNER_QUERY`, `KNOWLEDGE_QUERY`, `HYBRID_QUERY`, `ACTION_REQUEST`, `GENERAL_QUERY`).
- **Tool Registry**: 17 READ tools (automatic execution) and 7 WRITE tools (requires explicit UI confirmation card).
- **Action Planner**: Formats proposed write actions with target ID, old values, proposed new values, reason, and `requiresConfirmation=True`.
- **Insight Engine**: Generates proactive insights with evidence strength ratings (`STRONG`, `MODERATE`, `LIMITED`).

---

## 5. Security & Action Safety Guarantees
- JWT authentication required on all `/api/scout/*` endpoints.
- User data queries are strictly scoped to `authenticatedUser.id`.
- **Zero Raw SQL**: SCOUT never executes arbitrary AI-generated SQL. All actions use controlled backend tools.
- **Action Revalidation**: Constraint check occurs immediately before action execution.
- `GEMINI_API_KEY` remains server-side only in Python environment variables; never exposed to Vite frontend.
