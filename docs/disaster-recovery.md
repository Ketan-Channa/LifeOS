# LifeOS Disaster Recovery & Backup Strategy

## 1. Backup Schedule & Strategy

| Layer | Backup Frequency | Target Location | Retention | RPO / RTO |
| :--- | :--- | :--- | :--- | :--- |
| **MySQL Database (`lifeos_db`)** | Daily Automated Snapshot + Point-in-Time | Encrypted Offsite S3 Bucket | 30 Days Retention | RPO: 5 min, RTO: 30 min |
| **Vector Store (RAG Embeddings)** | Daily Snapshot | Persistent Volume / S3 | 14 Days Retention | RPO: 24 hrs, RTO: 15 min |
| **Uploaded User Documents** | Synchronous Mirroring | Encrypted Storage | 30 Days Retention | RPO: 0 min, RTO: 5 min |

---

## 2. Database Restoration Protocol

```bash
# 1. Stop active Express application instances
pm2 stop lifeos-backend

# 2. Restore MySQL snapshot from backup
mysql -u root -p lifeos_db < /backups/lifeos_db_daily_latest.sql

# 3. Apply schema migrations
npx prisma db push --schema=./database/prisma/schema.prisma

# 4. Verify DB connectivity and readiness
curl -f http://localhost:5000/ready

# 5. Restart Express backend
pm2 restart lifeos-backend
```

---

## 3. Incident Recovery Procedures

- **Database Disconnection**: The `/ready` probe responds HTTP 530, causing load balancers to temporarily route traffic away while database connections auto-reconnect.
- **AI Service Fallback**: If Gemini or Python AI service is degraded, core task, goal, schedule, and habit functions operate uninterrupted without AI features.
