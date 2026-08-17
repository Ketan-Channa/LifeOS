# LifeOS — Personal Operating System & AI Life Intelligence Platform

LifeOS is an all-in-one personal operating system and unified AI intelligence platform designed to automate schedule optimization, task management, goal tracking, habit analytics, behavioral pattern recognition, personal knowledge management (RAG), and autonomous AI agent loops.

---

## 🚀 Key Features Overview

- **Authentication & Security**: Secure bcrypt password hashing, legacy password auto-migration, security answer protection, DTO response filtering, rate limiting, and Helmet security headers.
- **Task & Time Management**: Drag-and-drop task organization, interactive task timer, telemetry tracking, and task completion history.
- **Goals & Milestones**: Goal tracking, milestone breakdown, and goal risk prediction analytics.
- **Habits & Routine Intelligence**: Daily habit logging, consistency scoring, and behavioral pattern recognition.
- **Predictive ML Engine**: Scikit-Learn machine learning predictions for task risk, goal risk, workload capacity, and productivity forecasts.
- **AI Plan My Day 2.0**: Multi-event daily schedule optimizer generating 4 candidate plans (Balanced, Priority First, Energy Matching, Workload Compact) with plan validation and PDF exports.
- **Personal Knowledge Base & RAG**: Document upload (PDF/TXT), chunk processing, vector search embeddings, and citation-backed Retrieval-Augmented Generation.
- **SCOUT AI Unified Agent**: Conversational life intelligence agent with intent classification, tool calling, daily briefings, and weekly reviews.
- **Full Autonomous AI Agent Engine**: Bounded agent execution loop (`OBSERVE -> UNDERSTAND -> PLAN -> SELECT TOOLS -> EXECUTE SAFE ACTIONS -> OBSERVE RESULT -> EVALUATE -> ADAPT`), user approval workflows, action revalidation, prompt injection defense, and reversible action rollback (undo).

---

## 🛠️ Architecture & Tech Stack

```
                         LIFEOS PLATFORM
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
      FRONTEND               BACKEND               AI LAYER
          │                     │                     │
       React 18               Express               FastAPI
       Vite                   Prisma                Scikit-Learn
       TypeScript             MySQL                 RAG Vector
       Tailwind               Bcrypt                Gemini API
```

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, Code-Splitting (`React.lazy`), ErrorBoundary.
- **Backend**: Node.js, Express, Prisma ORM, MySQL, Bcrypt, Helmet, Express-Rate-Limit.
- **AI Microservice**: Python 3.10+, FastAPI, Scikit-Learn, ReportLab PDF, Vector Embeddings, Gemini 1.5 Pro API.

---

## 📦 Setup & Development

### 1. Environment Setup
Copy `.env.example` to `.env` in the root workspace and update credentials:
```bash
cp .env.example .env
```

### 2. Backend Engine
```bash
cd backend
npm install
npm run prisma:push
npm run dev
```

### 3. Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

### 4. Frontend Client
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Security & Production Guidelines
- **No Plaintext Passwords**: All user passwords and security answers are hashed using `bcrypt`.
- **User Isolation (IDOR Protection)**: 100% of resource queries filter strictly by `userId`.
- **Prompt Injection Defense**: External task/document content is sanitized and treated as data rather than executable instructions.
- **Health Probes**: `/health` and `/ready` endpoints are exposed on both backend servers for container orchestration.

---

## 📚 Technical Documentation
- [Security Audit Report](docs/security-audit.md)
- [Production Deployment Guide](docs/production-deployment.md)
- [Disaster Recovery & Backup Strategy](docs/disaster-recovery.md)
- [Performance & Optimization Strategy](docs/performance.md)
- [Testing Suite Strategy](docs/testing.md)
- [API Reference](docs/api.md)
- [Architecture Specifications](docs/architecture.md)

---

## 📜 License & Credits
Designed and Developed for **LifeOS Platform**. Built with Google Gemini AI.
