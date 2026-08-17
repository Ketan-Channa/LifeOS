# LifeOS Analytics Engine & Behavioral Intelligence Specifications

## 1. Architectural Philosophy & Intelligence Pipeline

LifeOS implements a **zero-hallucination data pipeline**. Numerical insights, score trajectories, capacity thresholds, and behavioral pattern detections are computed strictly using deterministic mathematical formulas over MySQL database records via Pandas & NumPy.

$$\text{MYSQL TELEMETRY} \longrightarrow \text{FASTAPI ANALYTICS ENGINE} \longrightarrow \text{STATISTICAL CALCULATIONS} \longrightarrow \text{PATTERN RECOGNITION} \longrightarrow \text{STRUCTURED JSON INSIGHTS}$$

---

## 2. Mathematical Formulas & Telemetry Calculations

### A. Weighted Productivity Score
The Productivity Score is a normalized composite score ($0 \text{--} 100$) calculated as:

$$\text{Productivity Score} = 0.35 \times \text{CompletionRate} + 0.25 \times \text{OnTimeRate} + 0.20 \times \text{EstimationAccuracy} + 0.20 \times \text{GoalProgress}$$

Where:
* **Completion Rate (%)**: $\frac{\text{Completed Tasks}}{\text{Total Tasks}} \times 100$
* **On-Time Rate (%)**: $\frac{\text{Completed On or Before Due Date}}{\text{Completed Tasks with Due Dates}} \times 100$
* **Estimation Accuracy Score**: $\text{Mean}\left(\max\left(0, 100 - \frac{|\text{Actual Mins} - \text{Estimated Mins}|}{\text{Estimated Mins}} \times 100\right)\right)$
* **Goal Progress Score**: Average progress % across user goals.

### B. Estimation Error Percentage & MAPE
* **Estimation Error (%)**: $\frac{\text{Average Actual Minutes} - \text{Average Estimated Minutes}}{\text{Average Estimated Minutes}} \times 100$
  * Positive ($+X\%$): User underestimates task completion time.
  * Negative ($-X\%$): User overestimates task completion time.
* **Mean Absolute Percentage Error (MAPE)**:
  $$\text{MAPE} = \frac{1}{N} \sum_{i=1}^{N} \left| \frac{\text{Actual}_i - \text{Estimated}_i}{\text{Estimated}_i} \right| \times 100$$

### C. Workload Pressure Classification
Workload capacity compares current planned task hours against historical average daily completed capacity:

$$\text{Historical Daily Capacity (Hours)} = \text{Mean}(\text{Daily Completed Task Hours})$$

Workload Pressure Thresholds:
* **LOW**: Planned Workload $< 80\%$ of Historical Capacity
* **MEDIUM**: $80\% \le \text{Planned Workload} \le 110\%$ of Capacity
* **HIGH**: Planned Workload $> 110\%$ of Capacity

### D. Goal Velocity & Risk Modeling
* **Goal Velocity (%/day)**: $\frac{\text{Current Goal Progress (\%)}}{\text{Elapsed Days Since Goal Start}}$
* **Deterministic Goal Risk**:
  * `HIGH RISK`: Goal is overdue OR remaining days $\le 7$ with progress $< 50\%$.
  * `MEDIUM RISK`: Remaining days $\le 14$ with progress $< 40\%$.
  * `LOW RISK` / `ON TRACK`: Progress pace aligns with target deadline.

---

## 3. Data Sufficiency Rules & Minimum Thresholds

To prevent false claims or misleading charts on empty datasets, every analytic enforces a minimum threshold:

| Analytic Metric | Minimum Threshold Requirement | Output if Insufficient |
| :--- | :--- | :--- |
| **Productivity Score** | $\ge 1$ Completed Task | `{ "available": false, "reason": "Insufficient task data" }` |
| **Productivity by Hour / Day** | $\ge 5$ Completed Tasks | Render structured empty state |
| **Estimation Accuracy Trend** | $\ge 3$ Tasks with valid `actualMinutes` | Render structured empty state |
| **Postponement Pattern** | $\ge 3$ Postponement events in `TaskHistory` | Omit pattern from top list |
| **Goal Velocity** | $\ge 1$ Active Goal with progress $> 0$ | Render empty velocity badge |

---

## 4. Behavioral Pattern Types & Confidence Scoring

The Pattern Engine evaluates statistical variance across historical telemetry and surfaces 12 deterministic pattern types:

1. `PRODUCTIVE_TIME` — Identifies peak completion hour (0-23).
2. `PRODUCTIVE_DAY` — Identifies highest completion weekday (Mon-Sun).
3. `ESTIMATION_ERROR` — Identifies estimation bias ($+X\%$ underestimation).
4. `POSTPONEMENT_PATTERN` — Flags high postponement frequency ($\ge 15\%$).
5. `CATEGORY_DELAY` — Identifies workload category with highest focus/delay.
6. `WORKLOAD_PATTERN` — Flags workload pressure when planned hours exceed capacity.
7. `COMPLETION_PATTERN` — Highlights high completion rate milestones.
8. `PRIORITY_PATTERN` — Compares completion rates across priority tiers.
9. `ENERGY_PATTERN` — Compares task success by energy level (LOW/MEDIUM/HIGH).
10. `GOAL_PROGRESS_PATTERN` — Highlights fast goal velocity.
11. `DEADLINE_PATTERN` — Identifies overdue deadline risks.
12. `PRODUCTIVITY_TREND` — Evaluates 7-day moving trend trajectory.

### Confidence Scoring Methodology
Statistical confidence ($0.0 \text{--} 1.0$) is calculated based on sample size $N$:
* $N < 5$: Confidence $= 0.45$ (`INITIAL`)
* $5 \le N < 15$: Confidence $= 0.65$ (`INITIAL`)
* $15 \le N < 30$: Confidence $= 0.78$ (`MODERATE`)
* $N \ge 30$: Confidence $= 0.92$ (`STRONG`)

---

## 5. API Endpoints Contract

### Node Backend Proxy (`/api/analytics`)
* `GET /api/analytics/overview?dateRange=last_30_days`
* `GET /api/analytics/productivity?dateRange=last_30_days`
* `GET /api/analytics/tasks?dateRange=last_30_days`
* `GET /api/analytics/workload?dateRange=last_30_days`
* `GET /api/analytics/goals?dateRange=last_30_days`
* `GET /api/analytics/patterns?dateRange=last_30_days`

### Python FastAPI Service (`http://localhost:8000/analyze`)
* `POST /analyze/overview`
* `POST /analyze/productivity`
* `POST /analyze/tasks`
* `POST /analyze/workload`
* `POST /analyze/goals`
* `POST /analyze/patterns`
* `GET /health`
