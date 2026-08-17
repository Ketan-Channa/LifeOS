# LifeOS Machine Learning Models & Evaluation Metrics

## 1. Task Deadline & Postponement Model (`task_risk_v1`)
- **Algorithm**: Scikit-Learn `RandomForestClassifier` (100 estimators, balanced class weights).
- **Target Variable**: `target_risk` ($0 = \text{on time}, 1 = \text{delayed/overdue}$).
- **Feature Set**:
  - `estimatedMinutes` (Float)
  - `priority` (Categorical: LOW, MEDIUM, HIGH, URGENT)
  - `category` (Categorical: Project, Academic, Career, etc.)
  - `energyLevel` (Categorical: LOW, MEDIUM, HIGH)
  - `daysUntilDue` (Float)
  - `dayOfWeek` (Categorical: Monday through Sunday)
  - `categoryCompletionRate` (Float: 0.0 - 1.0)
  - `postponementCount` (Float)
- **Evaluation Metrics**:
  - Accuracy: $\ge 0.85$
  - F1 Score: $\ge 0.82$
  - Precision: $\ge 0.80$
  - Recall: $\ge 0.84$

---

## 2. Goal Completion Risk Model (`goal_risk_v1`)
- **Algorithm**: Scikit-Learn `RandomForestClassifier` (50 estimators).
- **Target Variable**: `target_on_track` ($0 = \text{missed/at risk}, 1 = \text{on track}$).
- **Feature Set**:
  - `progress` (Float: 0.0 - 100.0)
  - `daysRemaining` (Float)
  - `requiredDailyProgress` ($\frac{100 - \text{progress}}{\text{daysRemaining}}$)
  - `priority` (Categorical)
  - `postponementRate` (Float)
- **Evaluation Metrics**:
  - Accuracy: $\ge 0.88$
  - F1 Score: $\ge 0.86$

---

## 3. Productivity Regressor Model (`productivity_v1`)
- **Algorithm**: Scikit-Learn `RandomForestRegressor`.
- **Target Variable**: Next-day productivity score ($0\text{--}100$).
- **Feature Set**:
  - `completionRate` (Float)
  - `onTimeRate` (Float)
  - `habitScore` (Float)
  - `focusHours` (Float)
- **Evaluation Metrics**:
  - MAE (Mean Absolute Error): $\le 3.5$ points

---

## 4. Workload Overload Classifier (`workload_risk_v1`)
- **Target Variable**: Tomorrow's workload risk (`LOW`, `NORMAL`, `HIGH`).
- **Capacity Threshold**: Scheduled duration vs 6.0 hours historical capacity limit.
