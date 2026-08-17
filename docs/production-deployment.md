# LifeOS Production Deployment Guide

> Production deployment and security guide for the LifeOS AI-powered Personal Operating System.

---

# 1. Production Architecture

LifeOS is designed as a multi-service full-stack application consisting of:

- React + Vite frontend
- Node.js + Express backend
- Python + FastAPI AI service
- MySQL database
- Prisma ORM
- Machine Learning services
- RAG/vector storage
- Gemini AI integration

The recommended production architecture is:

```text
                              USERS
                         Browsers / Mobile
                                  │
                                  ▼
                           HTTPS / SSL
                                  │
                                  ▼
                         VERCEL FRONTEND
                     React + Vite + TypeScript
                                  │
                                  │ HTTPS / REST API
                                  ▼
                       NODE.JS / EXPRESS
                            BACKEND API
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
            MANAGED MYSQL   PYTHON FASTAPI     PAYMENT
             DATABASE        AI SERVICE        SERVICE
                                  │
                         ┌────────┴────────┐
                         │                 │
                         ▼                 ▼
                    SCikit-Learn          RAG
                         │              / Vector
                         │               Store
                         └────────┬────────┘
                                  │
                                  ▼
                              GEMINI AI
```

---

# 2. Production Components

## 2.1 Frontend

Technology:

- React
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- Axios

Recommended deployment:

```text
Vercel
```

The frontend is responsible for:

- Landing page
- Authentication
- Registration
- Login
- Password recovery
- Dashboard
- Tasks
- Goals
- Schedule
- Habits
- Analytics
- Notifications
- Profile
- Subscription interface
- SCOUT AI interface
- AI Plan My Day
- AI Agent interface
- PDF generation/download
- Theme management

---

# 3. Backend

Technology:

- Node.js
- Express
- TypeScript
- Prisma
- MySQL
- JWT
- Bcrypt
- Zod

Recommended deployment:

```text
Render / Railway / AWS / equivalent Node.js hosting
```

The backend is responsible for:

- Authentication
- Authorization
- JWT management
- User management
- Task management
- Goal management
- Schedule management
- Habit management
- Analytics
- Notifications
- Subscription management
- Payment integration
- AI orchestration
- SCOUT AI requests
- AI Agent orchestration
- Database operations
- API security

---

# 4. AI Service

Technology:

- Python
- FastAPI
- Scikit-Learn
- RAG
- Gemini API

Recommended deployment:

```text
Render / Railway / AWS / equivalent Python hosting
```

The AI service is responsible for:

- Productivity prediction
- Behavioral pattern recognition
- Task prediction
- Deadline risk prediction
- Productivity analysis
- Recommendation generation
- Machine Learning inference
- RAG processing
- AI planning
- AI intelligence services

---

# 5. Database

Production database:

```text
Managed MySQL
```

The production database must be separate from:

- Local development database
- Testing database
- Development seed data

Production database credentials must only be stored in the hosting provider's environment-variable configuration.

---

# 6. Repository Structure

The production repository should follow the LifeOS monorepo structure:

```text
LifeOS/
│
├── frontend/
│
├── backend/
│
├── ai-service/
│
├── database/
│
├── shared/
│
├── docs/
│
├── .gitignore
├── .env.example
├── README.md
├── package.json
└── package-lock.json
```

The following should NOT be committed:

```text
node_modules/
.env
.env.local
.env.production
venv/
.venv/
__pycache__/
dist/
build/
storage/
uploads/
```

---

# 7. Environment Variables

## 7.1 Backend Environment Variables

Production backend environment variables should be configured through the hosting provider.

Example:

```ini
NODE_ENV=production
PORT=5000

DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME"

CLIENT_URL="https://YOUR-FRONTEND-DOMAIN"

JWT_SECRET="GENERATE-A-LONG-RANDOM-PRODUCTION-SECRET"

GEMINI_API_KEY="YOUR-GEMINI-API-KEY"

PYTHON_AI_SERVICE_URL="https://YOUR-AI-SERVICE-DOMAIN"

PAYMENT_SECRET="YOUR-PAYMENT-PROVIDER-SECRET"
```

These values are examples only.

Never replace the placeholders inside this documentation with real credentials.

---

# 8. AI Service Environment Variables

The AI service should receive its configuration through the hosting provider.

Example:

```ini
ENV=production
PORT=8000

GEMINI_API_KEY="YOUR-GEMINI-API-KEY"

VECTOR_DB_PATH="/var/data/vector_store"
```

If a managed vector database is used, its credentials must also be stored as environment variables.

---

# 9. Frontend Environment Variables

Frontend environment variables must contain only values that are safe to expose to the browser.

Example:

```ini
VITE_API_BASE_URL="https://YOUR-BACKEND-DOMAIN"
```

Never expose private credentials through frontend environment variables.

The frontend must NEVER contain:

```text
DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
PAYMENT_SECRET
PRIVATE_KEY
```

---

# 10. Local Environment Files

Local development may use:

```text
backend/.env
database/.env
ai-service/.env
```

These files must remain local.

They must be ignored by Git.

The repository may contain:

```text
.env.example
```

with placeholders only.

---

# 11. `.env.example`

A safe example configuration can look like:

```ini
NODE_ENV=development
PORT=5000

DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/lifeos_db"

CLIENT_URL="http://localhost:5173"

JWT_SECRET="YOUR-DEVELOPMENT-JWT-SECRET"

GEMINI_API_KEY="YOUR-GEMINI-API-KEY"

PYTHON_AI_SERVICE_URL="http://localhost:8000"

PAYMENT_SECRET="YOUR-PAYMENT-PROVIDER-SECRET"
```

The values in `.env.example` must never be real credentials.

---

# 12. Secret Management

The following information must never be committed to GitHub:

- Database passwords
- JWT secrets
- Gemini API keys
- Payment API keys
- Payment secrets
- Private keys
- SMTP passwords
- OAuth client secrets
- Cloud credentials
- Personal account credentials

Production secrets belong in:

```text
Hosting Provider Environment Variables
```

not in the Git repository.

---

# 13. JWT Security

The backend must load the JWT secret from an environment variable.

Example:

```typescript
const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

Never hardcode a production JWT secret inside source code.

Never expose the JWT secret to the frontend.

---

# 14. Gemini API Security

The Gemini API key must remain server-side.

The frontend must never directly expose the production Gemini API key.

The backend or AI service should access it through:

```text
GEMINI_API_KEY
```

Example:

```python
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
```

Never commit the actual API key to GitHub.

---

# 15. Database Security

The production MySQL database should:

- Use strong credentials
- Use encrypted connections where supported
- Restrict network access where possible
- Use a dedicated production database
- Use a dedicated production database user
- Avoid using the MySQL root account
- Maintain regular backups
- Use Prisma migrations for schema changes

Never place production database credentials in source code.

---

# 16. Prisma Production Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Production migrations should be deployed using:

```bash
npx prisma migrate deploy
```

Do NOT use:

```bash
npx prisma db push
```

as the normal production migration strategy.

Production schema changes should be tracked using Prisma migration files.

---

# 17. Prisma Migration Workflow

Development:

```bash
npx prisma migrate dev
```

Review and test the migration.

Commit the migration files to GitHub.

Production:

```bash
npx prisma migrate deploy
```

This keeps the production database schema synchronized with the version-controlled Prisma migrations.

---

# 18. Backend Build

From the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Generate Prisma client if required:

```bash
npx prisma generate
```

Build the TypeScript backend:

```bash
npm run build
```

The build must complete successfully before deployment.

---

# 19. Frontend Build

From the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Build the Vite application:

```bash
npm run build
```

The production build should complete successfully.

---

# 20. AI Service Setup

From:

```text
ai-service/
```

Install the Python dependencies according to the project's dependency configuration.

The AI service must start successfully using its configured production startup command.

The service should expose a health endpoint.

Example:

```text
GET /health
```

---

# 21. Backend Health Check

The backend should expose:

```text
GET /health
```

A health endpoint should return a simple status response.

Example:

```json
{
  "status": "ok"
}
```

Health endpoints must not expose:

- Database passwords
- API keys
- JWT secrets
- Payment secrets
- Internal credentials

---

# 22. Backend Readiness Check

If implemented, the backend should expose:

```text
GET /ready
```

The readiness endpoint can verify that required services are available.

For example:

```text
Backend
   │
   ├── Database connection
   │
   ├── Required configuration
   │
   └── AI service availability
```

Do not expose sensitive configuration values in the response.

---

# 23. AI Service Health Check

The AI service should expose:

```text
GET /health
```

The endpoint should verify that the AI service is running.

It must not return:

```text
GEMINI_API_KEY
```

or any other secret.

---

# 24. CORS Configuration

Production CORS should allow only the deployed frontend.

Example:

```text
https://your-lifeos-frontend.vercel.app
```

Avoid:

```text
*
```

for credential-enabled production APIs.

The backend should explicitly configure the allowed frontend origin through:

```text
CLIENT_URL
```

---

# 25. HTTPS

All production communication should use HTTPS.

Recommended flow:

```text
Browser
   │
   │ HTTPS
   ▼
Vercel Frontend
   │
   │ HTTPS
   ▼
Express Backend
   │
   ├──── HTTPS ────► FastAPI AI Service
   │
   └──── Secure ───► MySQL
```

Do not use unsecured HTTP for production authentication or sensitive application data.

---

# 26. Authentication Security

Production authentication should use:

- Bcrypt password hashing
- JWT authentication
- Protected API routes
- Authorization middleware
- Secure environment variables
- Input validation
- Rate limiting

Passwords must never be stored as plaintext in a production authentication design.

The legacy plaintext-password compatibility field should be removed once the migration to hashed-password authentication is complete.

---

# 27. Password Recovery

Password recovery must:

- Verify the user's identity
- Use secure reset tokens where applicable
- Avoid exposing whether sensitive accounts exist
- Store passwords using secure hashing
- Never log passwords
- Never return passwords through API responses

Security answers should also be handled securely.

---

# 28. Payment Security

Payment secrets must remain server-side.

Never commit:

```text
PAYMENT_SECRET
```

or payment provider credentials to GitHub.

Never store:

- CVV
- Card PIN
- Full card details

The backend should verify payment results using the payment provider's server-side verification mechanism.

---

# 29. Production CORS and API Flow

```text
                     VERCEL
                React + Vite
                     │
                     │ HTTPS
                     ▼
              EXPRESS BACKEND
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
     MYSQL        FASTAPI       PAYMENT
    DATABASE     AI SERVICE      SERVICE
                     │
              ┌──────┴──────┐
              ▼             ▼
             ML            RAG
                            │
                            ▼
                         GEMINI
```

---

# 30. AI Architecture

LifeOS AI functionality can be represented as:

```text
User Data
    │
    ▼
Backend
    │
    ▼
AI Service
    │
    ├──────────────► Behavioral Analysis
    │
    ├──────────────► Pattern Recognition
    │
    ├──────────────► Productivity Prediction
    │
    ├──────────────► Deadline Risk
    │
    ├──────────────► Recommendation Engine
    │
    ├──────────────► Machine Learning
    │
    ├──────────────► RAG
    │
    └──────────────► Gemini
```

---

# 31. AI Agent Architecture

The AI Agent should operate through a controlled backend workflow:

```text
User
 │
 ▼
Frontend
 │
 ▼
Backend
 │
 ▼
AI Agent
 │
 ├── Understand Request
 │
 ├── Read Relevant User Data
 │
 ├── Analyze Context
 │
 ├── Generate Plan
 │
 ├── Request Approval When Required
 │
 ├── Execute Authorized Action
 │
 └── Return Result
```

Agent operations should respect user authorization and application permissions.

---

# 32. AI Plan My Day

The AI planning workflow should consider:

- Existing tasks
- Task priorities
- Estimated durations
- Deadlines
- Goals
- Habits
- Existing schedule events
- Energy levels
- User preferences
- Available time
- Task dependencies where applicable

The planner can generate multiple planning combinations.

Example:

```text
Plan A — High Focus
Plan B — Balanced
Plan C — Low Energy
```

The user can select an appropriate plan before applying it.

---

# 33. PDF Export

If the application provides PDF export:

```text
AI Plan
   │
   ▼
Generated Schedule
   │
   ▼
PDF Generation
   │
   ▼
User Download
```

Generated PDFs should not be permanently stored unless required.

If stored, they must not be committed to GitHub.

---

# 34. RAG Security

RAG data may contain user-generated information.

Therefore:

- User documents must remain private
- User data must be isolated by user identity
- Vector data must not be shared between users
- Authentication must be enforced before retrieval
- Sensitive data should not be exposed in AI responses

Never commit user-uploaded documents or private vector data to GitHub.

---

# 35. Storage

Application-generated storage should remain outside Git.

Examples:

```text
storage/
uploads/
generated/
temporary/
```

These directories should not contain committed user data.

Production storage should use appropriate persistent storage or object storage where required.

---

# 36. Environment Separation

LifeOS should maintain three conceptual environments.

## Development

```text
Local machine
Local database
Development API configuration
Development AI configuration
```

## Staging

```text
Separate deployment
Separate database
Staging environment variables
Staging frontend
```

## Production

```text
Vercel frontend
Production backend
Production AI service
Production MySQL
Production environment variables
```

Never mix development and production credentials.

---

# 37. Seed Data

Development seed data should not automatically be inserted into production.

Do not automatically run:

```bash
npm run seed
```

during a production deployment.

The production database should contain only intentional production data.

The demo seed account should be used for:

- Local development
- Testing
- Demonstrations
- Controlled staging environments

---

# 38. Backend Deployment Checklist

Before deploying the backend:

- [ ] Production environment variables configured
- [ ] Production MySQL configured
- [ ] Prisma client generated
- [ ] Prisma migrations deployed
- [ ] CORS configured
- [ ] HTTPS enabled
- [ ] `/health` verified
- [ ] `/ready` verified
- [ ] Rate limiting enabled
- [ ] Helmet/security headers enabled
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] User ownership checks tested
- [ ] Error handling verified
- [ ] Production logs verified

---

# 39. AI Service Deployment Checklist

Before deploying the AI service:

- [ ] Python dependencies installed
- [ ] Production environment configured
- [ ] Gemini API key configured securely
- [ ] ML components verified
- [ ] RAG components verified
- [ ] Vector storage configured
- [ ] `/health` verified
- [ ] AI endpoints tested
- [ ] No API keys returned by endpoints
- [ ] No development-only file paths required

---

# 40. Frontend Deployment Checklist

Before deploying the frontend:

- [ ] Production API URL configured
- [ ] Vite build successful
- [ ] Authentication working
- [ ] Dashboard working
- [ ] Tasks working
- [ ] Goals working
- [ ] Schedule working
- [ ] Habits working
- [ ] Analytics working
- [ ] Notifications working
- [ ] SCOUT working
- [ ] AI Plan My Day working
- [ ] AI Agent working
- [ ] Profile working
- [ ] Subscription interface working
- [ ] PDF export working
- [ ] Light/Dark theme working
- [ ] Mobile responsiveness verified

---

# 41. GitHub Security Checklist

Before pushing the repository:

- [ ] `.env` files ignored
- [ ] `.env.local` ignored
- [ ] `.env.production` ignored
- [ ] `node_modules` ignored
- [ ] Python virtual environments ignored
- [ ] Python cache ignored
- [ ] Build output ignored
- [ ] Storage ignored
- [ ] Uploads ignored
- [ ] API keys removed
- [ ] Database passwords removed
- [ ] JWT secrets removed
- [ ] Payment secrets removed
- [ ] Private keys removed
- [ ] Personal credentials removed
- [ ] Seed credentials reviewed
- [ ] Deployment documentation sanitized
- [ ] `.env.example` contains placeholders only
- [ ] Staged files reviewed

---

# 42. Secret Scanning

Before the first GitHub commit, search the project for sensitive patterns such as:

```text
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
API_KEY=
SECRET_KEY=
PASSWORD=
PAYMENT_SECRET=
PRIVATE_KEY=
```

Also check for:

```text
AIza
-----BEGIN PRIVATE KEY-----
mysql://
postgres://
mongodb://
```

Any real credentials discovered must be removed before committing.

If a credential has already been exposed publicly, it should be rotated immediately.

---

# 43. Production Database Migration Checklist

Generate Prisma:

```bash
npx prisma generate
```

Deploy migrations:

```bash
npx prisma migrate deploy
```

Verify:

- [ ] Database connection
- [ ] Tables
- [ ] Relationships
- [ ] Foreign keys
- [ ] Indexes
- [ ] Required columns
- [ ] Prisma client
- [ ] Migration status

Do not use `prisma db push` as the standard production migration process.

---

# 44. Production Testing

After deployment, test the complete application.

## Authentication

1. Registration
2. Login
3. Logout
4. Forgot password
5. Password reset

## Profile

6. Profile details
7. Plan information
8. Subscription upgrade
9. Profile updates

## Core Modules

10. Tasks
11. Task timer
12. Task history
13. Goals
14. Milestones
15. Schedule
16. Habits
17. Analytics
18. Notifications

## AI

19. SCOUT AI
20. AI Plan My Day
21. Multiple planning combinations
22. Behavioral insights
23. Pattern recognition
24. ML predictions
25. RAG
26. AI Agent
27. Agent approval
28. Agent execution

## Other

29. PDF export
30. Light mode
31. Dark mode
32. Responsive layout
33. Subscription interface

---

# 45. Health Monitoring

Production monitoring should verify:

```text
Frontend
   │
   ├── Available
   │
   ▼
Backend
   │
   ├── Database connection
   │
   ├── Authentication
   │
   └── API availability
   │
   ▼
AI Service
   │
   ├── ML
   │
   ├── RAG
   │
   └── Gemini
```

Monitoring systems should never log sensitive credentials.

---

# 46. Logging

Production logs should be useful for debugging without exposing private information.

Never log:

```text
Passwords
JWT secrets
API keys
Payment secrets
Full authentication tokens
Full payment credentials
```

Use structured logs where possible.

---

# 47. Error Handling

Production APIs should:

- Return appropriate HTTP status codes
- Avoid exposing stack traces to users
- Avoid exposing database details
- Avoid exposing environment variables
- Log internal errors securely
- Provide useful but safe client messages

---

# 48. Rate Limiting

Rate limiting should be applied to sensitive endpoints, especially:

- Login
- Registration
- Password recovery
- AI requests
- Agent requests
- Payment operations

This helps protect the system from abuse.

---

# 49. Production URL Configuration

After deployment, record the actual URLs here:

```text
Frontend:
https://YOUR-LIFEOS-FRONTEND.vercel.app

Backend:
https://YOUR-LIFEOS-BACKEND.example.com

AI Service:
https://YOUR-LIFEOS-AI.example.com
```

These are placeholders.

Replace them only after the services have actually been deployed.

---

# 50. Final Production Architecture

```text
                              LIFEOS
                                 │
                                 ▼
                         ┌──────────────┐
                         │    VERCEL    │
                         │ React + Vite │
                         └──────┬───────┘
                                │
                              HTTPS
                                │
                                ▼
                     ┌────────────────────┐
                     │   NODE / EXPRESS   │
                     │      BACKEND       │
                     └───────┬─────┬──────┘
                             │     │
                 ┌───────────┘     └───────────┐
                 ▼                             ▼
        ┌────────────────┐             ┌───────────────┐
        │ MANAGED MYSQL  │             │ FASTAPI AI    │
        │    DATABASE    │             │    SERVICE    │
        └────────────────┘             └───────┬───────┘
                                               │
                                      ┌────────┴────────┐
                                      ▼                 ▼
                                     ML                RAG
                                                         │
                                                         ▼
                                                      GEMINI
```

---

# 51. Final Security Rules

The following rules must always be followed:

1. Never commit `.env` files.
2. Never commit production passwords.
3. Never commit API keys.
4. Never commit JWT secrets.
5. Never commit payment secrets.
6. Never commit private keys.
7. Never commit user-uploaded documents.
8. Never commit production database dumps.
9. Never expose server-side secrets to the frontend.
10. Never use development credentials in production.
11. Use Prisma migrations for production schema changes.
12. Use HTTPS for production communication.
13. Use secure password hashing.
14. Validate and authorize every protected request.
15. Rotate exposed credentials immediately.

---

# 52. Final Deployment Checklist

## GitHub

- [ ] Repository initialized correctly
- [ ] `.gitignore` verified
- [ ] No `.env` files staged
- [ ] No API keys staged
- [ ] No passwords staged
- [ ] No JWT secrets staged
- [ ] No payment secrets staged
- [ ] No personal credentials staged
- [ ] No `node_modules` staged
- [ ] No build output staged
- [ ] No user storage staged
- [ ] Staged files reviewed

## Database

- [ ] Production MySQL created
- [ ] Production credentials configured
- [ ] Prisma generated
- [ ] Prisma migrations deployed
- [ ] Database connection verified
- [ ] Backups configured

## Backend

- [ ] Backend deployed
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] `/health` verified
- [ ] `/ready` verified
- [ ] API endpoints tested

## AI Service

- [ ] AI service deployed
- [ ] Environment variables configured
- [ ] Gemini configured
- [ ] ML verified
- [ ] RAG verified
- [ ] Vector storage configured
- [ ] Health endpoint verified

## Frontend

- [ ] Frontend deployed to Vercel
- [ ] Production API URL configured
- [ ] Authentication tested
- [ ] Dashboard tested
- [ ] Tasks tested
- [ ] Goals tested
- [ ] Schedule tested
- [ ] Habits tested
- [ ] Analytics tested
- [ ] SCOUT tested
- [ ] AI Planner tested
- [ ] AI Agent tested
- [ ] Notifications tested
- [ ] Profile tested
- [ ] Subscription tested
- [ ] PDF export tested
- [ ] Theme switching tested
- [ ] Mobile responsiveness tested

---

# 53. Production Goal

The final LifeOS production system should provide:

- Secure authentication
- Secure database access
- Secure AI integration
- Machine Learning intelligence
- Behavioral pattern recognition
- RAG capabilities
- AI-powered planning
- AI Agent functionality
- Task intelligence
- Goal intelligence
- Schedule intelligence
- Habit intelligence
- Productivity analytics
- Notifications
- Subscription management
- Secure API communication
- Scalable frontend
- Production MySQL
- Production AI service
- HTTPS
- Environment-based secret management
- Version-controlled database migrations
- Health checks
- Production monitoring

---

# 54. LifeOS

> **LifeOS — Understand your life. Optimize your time. Achieve your goals.**

The production deployment should keep the frontend, backend, AI service, database, and secrets properly separated while maintaining secure communication between all application components.