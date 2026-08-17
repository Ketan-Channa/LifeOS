from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analytics import router as analytics_router
from app.routes.ai import router as ai_router
from app.routes.ml import router as ml_router
from app.routes.planner import router as planner_router
from app.routes.rag import rag_router
from app.routes.scout import scout_router
from app.routes.agent import agent_router

app = FastAPI(
    title="LifeOS Python Analytics Engine, Predictive ML, RAG & Autonomous Agent Engine",
    description="Data-driven statistical calculations, workload capacity modeling, Scikit-Learn Machine Learning predictions, multi-event daily planning engine, RAG Vector Knowledge Base, SCOUT AI & Autonomous Agent Engine.",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(ml_router)
app.include_router(planner_router)
app.include_router(rag_router)
app.include_router(scout_router)
app.include_router(agent_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LifeOS Python Analytics, Predictive ML, AI Daily Planner & RAG Vector Engine",
        "engine": "FastAPI + Scikit-Learn + ReportLab + RAG Vector Store + Gemini API",
        "analytics": "healthy",
        "ml": "healthy",
        "rag": "healthy",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/ready")
def readiness_check():
    return {
        "status": "ready",
        "service": "LifeOS Python Microservice",
        "dependencies": {
            "scikit_learn": "ready",
            "rag_vector_store": "ready",
            "gemini_api": "ready"
        }
    }

@app.get("/", response_class=HTMLResponse)
def root_status_page():
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LifeOS Python Analytics & Predictive ML Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #050811;
      color: #F8FAFC;
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .status-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(129, 140, 248, 0.2);
      border-radius: 24px;
      width: 100%;
      max-width: 680px;
      padding: 36px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand span {
      background: linear-gradient(135deg, #22D3EE, #818CF8, #C084FC);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background-color: #34D399;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-box {
      background: rgba(10, 15, 30, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
    }
    .stat-label {
      font-size: 11px;
      color: #94A3B8;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #F1F5F9;
      font-family: 'JetBrains Mono', monospace;
    }
    .link-btn {
      color: #38BDF8;
      text-decoration: none;
      transition: color 0.2s;
    }
    .link-btn:hover { color: #7DD3FC; text-decoration: underline; }

    .routes-section {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
    }
    .routes-title {
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .route-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(10, 15, 30, 0.4);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .method {
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
    }
    .method-post { background: rgba(168, 85, 247, 0.2); color: #C084FC; }
    .method-get { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #64748B;
    }
    .footer strong { color: #CBD5E1; }
  </style>
</head>
<body>
  <div class="status-card">
    <div class="header">
      <div class="brand">LIFE<span>OS</span> AI PLANNER & ML ENGINE</div>
      <div class="badge">
        <div class="pulse-dot"></div>
        <span>OPERATIONAL</span>
      </div>
    </div>

    <div class="grid">
      <div class="stat-box">
        <div class="stat-label">Microservice Port</div>
        <div class="stat-value">
          <a href="http://127.0.0.1:8000" target="_blank" class="link-btn">http://127.0.0.1:8000 ↗</a>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-label">AI Engine</div>
        <div class="stat-value" style="color: #38BDF8">FastAPI + Scikit-Learn + ReportLab</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Interactive Docs</div>
        <div class="stat-value">
          <a href="http://127.0.0.1:8000/docs" target="_blank" class="link-btn">Swagger OpenAPI ↗</a>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Planner Mode</div>
        <div class="stat-value" style="color: #34D399">AI Plan My Day 2.0</div>
      </div>
    </div>

    <div class="routes-section">
      <div class="routes-title">
        <span>AI Plan My Day 2.0 Endpoints</span>
        <span style="color: #818CF8; font-size: 10px; font-weight: 700;">HYBRID PLANNER</span>
      </div>
      <div class="route-item">
        <span><span class="method method-post">POST</span> /planner/generate</span>
        <span style="color: #34D399">Multi-Plan Candidates</span>
      </div>
      <div class="route-item">
        <span><span class="method method-post">POST</span> /planner/pdf-export</span>
        <span style="color: #C084FC">ReportLab PDF Export</span>
      </div>
    </div>

    <div class="footer">
      LifeOS AI Intelligence Engine — Designed and Developed by <strong>Ketan Channa</strong>
    </div>
  </div>
</body>
</html>
    """
    return HTMLResponse(content=html_content)
