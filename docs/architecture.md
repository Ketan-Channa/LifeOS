# LifeOS Production Architecture Overview

```
                         LIFEOS PLATFORM
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
      FRONTEND               BACKEND               AI LAYER
          │                     │                     │
       React                 Express                FastAPI
       Vite                  Prisma                 Gemini
       TypeScript            MySQL                  Scikit-Learn
       Tailwind              Helmet                 RAG Vector
                             Bcrypt                 SCOUT Agent
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                           SECURE APIs
                                ▼
                         AUTHORIZATION
                                ▼
                         DATABASE LAYER
                                ▼
                          OBSERVABILITY
                                ▼
                           DEPLOYMENT
```

## Architecture Layers

1. **Frontend Layer**: React 18 SPA built with Vite and TypeScript. Code-split with `React.lazy` and `React.Suspense` for optimal initial page load. Protected with top-level `ErrorBoundary`.
2. **Backend Engine Layer**: Node.js Express server configured with Helmet security headers, CORS origin restrictions, `express-rate-limit` rate limiters, bcrypt password hashing, and user-isolated Prisma ORM queries.
3. **AI Microservice Layer**: Python FastAPI microservice hosting Scikit-Learn predictive ML models, multi-plan daily schedule optimizer, RAG vector knowledge base, and SCOUT Autonomous AI Agent Engine (`OBSERVE -> PLAN -> EXECUTE -> EVALUATE`).
4. **Database Layer**: MySQL database `lifeos_db` managed via Prisma schema migrations with optimized composite indexes.
