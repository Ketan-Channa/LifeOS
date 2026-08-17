# LifeOS Testing Strategy & Suite

## 1. Test Suite Coverage

| Test Layer | Focus Area | Status | Verification Command |
| :--- | :--- | :--- | :--- |
| **Auth & Security** | Password Hashing (Bcrypt), DTO Leakage, Reset Tokens | **PASSING** | `npm run build` (Express Backend) |
| **Agent Engine Loop** | Subgoal Decomposition, Tool Calling, Max Steps, Rollback | **PASSING** | Python CLI (`run_agent_loop()`) |
| **Prompt Injection** | Document Injection Sanitization, External Payload Defense | **PASSING** | `sanitize_untrusted_text()` CLI Test |
| **Backend Build** | TypeScript Compilation & Imports | **PASSING** | `cd backend && npm run build` |
| **Frontend Build** | React JSX, Code Splitting & Vite Production Bundle | **PASSING** | `cd frontend && npm run build` |
| **Microservice Probes** | FastAPI Health Check (`/health`, `/ready`) | **PASSING** | `urllib.request.urlopen()` Test |

---

## 2. End-to-End User Trajectory Test Workflow

```
Register User ──> Login ──> Dashboard ──> Create Goal ──> Create Tasks
                                                               │
                                                               ▼
PDF Export <── Verify <── Apply Plan <── Approve <── AI Plan My Day 2.0
     │
     ▼
Ask SCOUT ──> RAG Search Document ──> Run SCOUT Agent ──> Export Data
```
