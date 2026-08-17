# LifeOS Habits & Routine Intelligence Documentation

## 1. System Overview
The **LifeOS Habit & Routine Intelligence Engine** provides a full recurring behavior tracking and behavioral correlation system. It tracks habit consistency, streaks, preferred completion times, routine breaks, category performance, and statistical Pearson correlations between daily habit completion and recorded focus time / productivity score.

---

## 2. Data Models (`database/prisma/schema.prisma`)

```prisma
enum Frequency {
  DAILY
  WEEKLY
  WEEKDAYS
  CUSTOM
}

model Habit {
  id              String         @id @default(uuid())
  userId          String
  goalId          String?
  name            String
  description     String?        @db.Text
  category        String         @default("Health")
  frequency       Frequency      @default(DAILY)
  customDays      String?        // MON,TUE,WED,THU,FRI,SAT,SUN
  targetValue     Float          @default(1.0)
  targetUnit      String         @default("session")
  preferredTime   String?        // e.g. "07:00", "19:00"
  priority        Priority       @default(MEDIUM)
  startDate       DateTime       @default(now())
  reminderMinutes Int?
  isActive        Boolean        @default(true)
  currentStreak   Int            @default(0)
  longestStreak   Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal            Goal?          @relation(fields: [goalId], references: [id], onDelete: SetNull)
  habitLogs       HabitLog[]
  habitHistories  HabitHistory[]

  @@index([userId])
  @@index([goalId])
  @@index([isActive])
  @@map("habits")
}

model HabitLog {
  id          String    @id @default(uuid())
  habitId     String
  userId      String
  date        String    // ISO YYYY-MM-DD
  status      String    @default("COMPLETED") // COMPLETED, PARTIAL, MISSED, SKIPPED
  value       Float     @default(1.0)
  targetValue Float     @default(1.0)
  completedAt DateTime?
  notes       String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  habit       Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([userId])
  @@index([habitId])
  @@index([date])
  @@map("habit_logs")
}

model HabitHistory {
  id        String   @id @default(uuid())
  habitId   String
  action    String   // CREATED, UPDATED, COMPLETED, SKIPPED, PAUSED, RESUMED, TARGET_CHANGED, FREQUENCY_CHANGED, ARCHIVED
  timestamp DateTime @default(now())
  metadata  String?  @db.Text
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@index([habitId])
  @@index([timestamp])
  @@map("habit_histories")
}
```

---

## 3. Core Engine Formulas & Methodology

### A. Habit Consistency Percentage
$$\text{Consistency} = \frac{\text{Successful Required Days (COMPLETED / PARTIAL)}}{\text{Total Required Scheduled Days}} \times 100\%$$

### B. Routine Consistency Score ($0\text{--}100$)
Composite formula combining average consistency and routine stability:
$$\text{Routine Score} = \min\left(100, \text{Math.round}(\text{AvgConsistency} \times 0.70 + \text{BestStreak} \times 1.5)\right)$$

### C. Pearson Correlation Coefficient ($r$)
Calculates statistical correlation between daily habit completion percentage ($x$) and daily focus time / productivity score ($y$):
$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$

**Strength Classification**:
- $|r| \ge 0.80$: Very Strong
- $0.60 \le |r| < 0.80$: Strong
- $0.40 \le |r| < 0.60$: Moderate
- $0.20 \le |r| < 0.40$: Weak
- $|r| < 0.20$: Very Weak

*Minimum Data Requirement*: At least 14 comparable days are required before displaying correlation insights.

---

## 4. REST API Specs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/habits` | List habits filtered by category, status, search |
| `GET` | `/api/habits/stats` | Summary stats (Total, Active, Completed Today, Best Streak, Consistency, Routine Score) |
| `GET` | `/api/habits/logs/today` | Habits due today with log status |
| `GET` | `/api/habits/logs/week` | 7-day weekly tracker matrix |
| `GET` | `/api/habits/logs/month` | GitHub-style monthly activity heatmap |
| `GET` | `/api/habits/:id` | Habit detail + logs + histories + goal info |
| `POST` | `/api/habits` | Create new habit |
| `PATCH` | `/api/habits/:id` | Update habit parameters |
| `DELETE` | `/api/habits/:id` | Delete habit |
| `PATCH` | `/api/habits/:id/pause` | Pause habit |
| `PATCH` | `/api/habits/:id/resume` | Resume habit |
| `PATCH` | `/api/habits/:id/archive` | Archive habit |
| `POST` | `/api/habits/:id/logs` | Log habit completion (`COMPLETED`, `PARTIAL`, `MISSED`, `SKIPPED`) |
