# LifeOS API Reference & Specifications

## 1. Authentication Endpoints (`/api/auth`)

- `POST /api/auth/register`: Register new account (hashes password & security answer with bcrypt).
- `POST /api/auth/login`: Authenticate credentials (supports legacy password migration).
- `POST /api/auth/logout`: End session.
- `GET /api/auth/me`: Get current user DTO (sanitized, password-free).
- `GET /api/auth/export-data`: Export complete JSON archive of user data.
- `DELETE /api/auth/account`: Permanently delete account and all user data.

---

## 2. Health & Observability Endpoints

- `GET /health` & `GET /api/health`: Returns service version, uptime, and database connection status.
- `GET /ready` & `GET /api/ready`: Readiness probe for load balancers. Returns 200 if database is connected, 503 if unavailable.

---

## 3. AI, RAG & SCOUT Agent Endpoints (`/api/ai`, `/api/scout`, `/api/agent`)

- `POST /api/ai-plans/generate`: Generate 4 candidate daily plans (AI Plan My Day 2.0).
- `POST /api/scout/chat`: Interactive chat with SCOUT AI Intelligence.
- `GET /api/scout/daily-briefing`: Synthesizes morning schedule & focus recommendation.
- `POST /api/agent/run`: Launch autonomous agent loop (`OBSERVE -> PLAN -> EXECUTE -> EVALUATE`).
- `GET /api/agent/settings` & `POST /api/agent/settings`: Manage agent autonomy level & permissions.
- `POST /api/agent/actions/:id/undo`: Revert reversible schedule or task modifications.
