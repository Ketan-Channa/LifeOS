# LifeOS Machine Learning Engine Architecture

## 1. System Philosophy & Layer Pipeline
The **LifeOS Machine Learning Engine** provides predictive risk intelligence across task deadlines, goal target completions, 7-day productivity forecasts, and workload overload warnings.

```
REAL USER DATA (Tasks, Goals, Habits, Schedule)
        ↓
FEATURE ENGINEERING (Data Leakage Prevention)
        ↓
PREPROCESSING PIPELINE (Scikit-Learn ColumnTransformer / OneHotEncoder)
        ↓
TRAINING PIPELINE (RandomForest & GradientBoosting Classifiers/Regressors)
        ↓
MODEL REGISTRY (Joblib Model Persistence & Versioning in /ai-service/models)
        ↓
PREDICTION ENGINE & RISK SCORING (F1, Precision, Recall, MAE)
        ↓
FASTAPI ML ENDPOINTS (/ml/predict/* & /ml/train/*)
        ↓
EXPRESS NODE PROXY (/api/predictions/*)
        ↓
GEMINI 1.5 REASONING & SCOUT AI ASSISTANT
        ↓
FRONTEND PREDICTIVE UI WIDGETS
```

---

## 2. Directory & Module Structure
- `/ai-service/app/ml/`
  - `schemas.py`: Pydantic request and response schemas for all ML endpoints.
  - `feature_engineering.py`: Feature extractions for Tasks and Goals with strict data leakage prevention (`completedAt` is strictly excluded from task prediction features).
  - `preprocessing.py`: Scikit-Learn `ColumnTransformer` with `OneHotEncoder` and `StandardScaler`.
  - `model_registry.py`: Joblib persistence & metadata management (`models/*.joblib` and `models/*_meta.json`).
  - `training.py`: Automated model training pipelines and dataset threshold checks.
  - `prediction_service.py`: Real-time inference engine with cold-start fallback states.
- `/ai-service/app/routes/ml.py`: FastAPI endpoints for ML predictions, health, and registry queries.
- `/backend/src/services/prediction.service.ts`: Express proxy service connecting to Python ML FastAPI.

---

## 3. Machine Learning Models
1. **`task_risk_v1`**: Scikit-Learn `RandomForestClassifier` predicting probability of task delay ($0.0\text{--}1.0$) and postponement likelihood.
2. **`goal_risk_v1`**: Scikit-Learn `RandomForestClassifier` predicting goal completion probability based on required daily progress vs velocity.
3. **`productivity_v1`**: Scikit-Learn `RandomForestRegressor` forecasting 7-day productivity score trends.
4. **`workload_risk_v1`**: Scikit-Learn classifier predicting tomorrow's workload overload (`LOW`, `NORMAL`, `HIGH`).

---

## 4. Cold-Start Strategy
When user data is below minimum thresholds ($<50$ tasks, $<20$ goal records, $<30$ days analytics), the system serves deterministic rule-based telemetry calculations with explicit fallback indicators (`available: true`, `reason: "Deterministic telemetry model active."`).
