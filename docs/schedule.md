# LifeOS Schedule Engine Documentation

## 1. System Overview
The **LifeOS Schedule Engine** provides a full calendar and time-planning system supporting Day (24-hour timeline), Week (7-day column grid), and Month (icons and cells) views. It unifies normal calendar events, scheduled task time blocks, deadlines, and goal milestones into a single telemetry surface.

---

## 2. Event & Telemetry Data Models (`database/prisma/schema.prisma`)

```prisma
enum EventType {
  TASK
  CLASS
  WORK
  PERSONAL
  MEETING
  EXERCISE
  OTHER
}

model ScheduleEvent {
  id                String            @id @default(uuid())
  userId            String
  title             String
  description       String?           @db.Text
  type              EventType         @default(OTHER)
  startTime         DateTime
  endTime           DateTime
  priority          Priority          @default(MEDIUM)
  location          String?
  isAllDay          Boolean           @default(false)
  recurrenceRule    String?           // DAILY, WEEKLY, MONTHLY
  reminderMinutes   Int?              // 5, 10, 15, 30, 60
  linkedTaskId      String?
  linkedGoalId      String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  linkedTask        Task?             @relation(fields: [linkedTaskId], references: [id], onDelete: SetNull)
  linkedGoal        Goal?             @relation(fields: [linkedGoalId], references: [id], onDelete: SetNull)
  scheduleHistories ScheduleHistory[]

  @@index([userId])
  @@index([startTime])
  @@map("schedule_events")
}

model ScheduleHistory {
  id                String        @id @default(uuid())
  eventId           String
  action            String        // CREATED, UPDATED, MOVED, RESIZED, DELETED
  previousStartTime DateTime?
  newStartTime      DateTime?
  previousEndTime   DateTime?
  newEndTime        DateTime?
  timestamp         DateTime      @default(now())
  event             ScheduleEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@map("schedule_histories")
}
```

---

## 3. Core Engine Algorithms

### A. Deterministic Conflict Detection
Discovers overlapping time windows between calendar events and scheduled tasks for a given date:
$$\text{Conflict IF } (\text{Start}_A < \text{End}_B) \land (\text{Start}_B < \text{End}_A)$$
Calculates `overlapMinutes` deterministically without AI hallucination.

### B. Free Time Slot Detection
Scans time windows between 06:00 and 23:00 to identify continuous unallocated blocks $\ge 30$ minutes. Available slots are fed directly to the AI Daily Plan generator.

### C. Schedule Adherence Engine
Compares planned task schedule times against actual execution telemetry:
$$\text{Start Delay} = \text{StartedAt} - \text{ScheduledStart}$$
$$\text{On-Time Start Rate} = \frac{\text{Count of tasks started within 15 mins}}{\text{Total scheduled tasks}} \times 100\%$$

---

## 4. REST API Specs (`/api/schedule`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/schedule/day?date=YYYY-MM-DD` | Day view events, scheduled tasks, and deadlines |
| `GET` | `/api/schedule/week?startDate=YYYY-MM-DD` | 7-day grid events and scheduled tasks |
| `GET` | `/api/schedule/month?year=YYYY&month=MM` | Monthly calendar events, deadlines, and milestones |
| `GET` | `/api/schedule/stats` | Daily scheduled hours, free hours, conflicts, and adherence |
| `GET` | `/api/schedule/conflicts?date=YYYY-MM-DD` | Overlapping event conflicts |
| `GET` | `/api/schedule/free-time?date=YYYY-MM-DD` | Available free time slots |
| `GET` | `/api/schedule/adherence` | Historical schedule adherence metrics |
| `POST` | `/api/schedule` | Create new calendar event + log history |
| `PATCH` | `/api/schedule/:id` | Update / move / resize event + log history |
| `DELETE` | `/api/schedule/:id` | Delete event |
