import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import taskRoutes from './routes/task.routes';
import goalRoutes from './routes/goal.routes';
import milestoneRoutes from './routes/milestone.routes';
import scheduleRoutes from './routes/schedule.routes';
import habitRoutes from './routes/habit.routes';
import noteRoutes from './routes/note.routes';
import dashboardRoutes from './routes/dashboard.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import predictionRoutes from './routes/prediction.routes';
import aiPlanRoutes from './routes/ai_plan.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import scoutRoutes from './routes/scout.routes';
import agentRoutes from './routes/agent.routes';
import notificationRoutes from './routes/notification.routes';
import prisma from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [CLIENT_URL] 
    : [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again later.' } }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'AI rate limit exceeded. Please wait a moment.' } }
});

const knowledgeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Knowledge upload rate limit exceeded.' } }
});

// Helper function to check MySQL connection
async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'MySQL Connected' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Database Disconnected' };
  }
}

// Root Server Status Dashboard Page (GET /)
app.get('/', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  const uptimeSeconds = Math.floor(process.uptime());

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LifeOS Backend Status Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #090D16;
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
      background: rgba(21, 28, 44, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      width: 100%;
      max-width: 650px;
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
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
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand span {
      background: linear-gradient(135deg, #818CF8, #C084FC, #22D3EE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
    }
    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background-color: currentColor;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
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
      font-size: 15px;
      font-weight: 600;
      color: #F1F5F9;
      font-family: 'JetBrains Mono', monospace;
    }
    .link-btn {
      color: #818CF8;
      text-decoration: none;
      transition: color 0.2s;
    }
    .link-btn:hover { color: #A5B4FC; text-decoration: underline; }

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
    }
    .route-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
    }
    .method {
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
    }
    .method-get { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
    .method-post { background: rgba(16, 185, 129, 0.2); color: #34D399; }

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
      <div class="brand">LIFE<span>OS</span> BACKEND</div>
      <div class="badge ${dbStatus.connected ? 'badge-success' : 'badge-error'}">
        <div class="pulse-dot"></div>
        <span>${dbStatus.connected ? 'SYSTEM OPERATIONAL' : 'DEGRADED / DB ISSUES'}</span>
      </div>
    </div>

    <div class="grid">
      <div class="stat-box">
        <div class="stat-label">Server Port</div>
        <div class="stat-value">
          <a href="http://localhost:${PORT}" target="_blank" class="link-btn">http://localhost:${PORT} ↗</a>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-label">MySQL Database</div>
        <div class="stat-value" style="color: ${dbStatus.connected ? '#34D399' : '#F87171'}">
          ${dbStatus.connected ? '🟢 Connected (lifeos_db)' : '🔴 Disconnected'}
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Environment</div>
        <div class="stat-value">${process.env.NODE_ENV || 'development'}</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Uptime</div>
        <div class="stat-value">${uptimeSeconds} seconds</div>
      </div>
    </div>

    <div class="routes-section">
      <div class="routes-title">Phase 8 Endpoint Interfaces</div>
      <div class="route-item">
        <span><span class="method method-get">GET</span> /api/predictions/overview</span>
        <span style="color: #C084FC">Predictive ML Overview</span>
      </div>
      <div class="route-item">
        <span><span class="method method-get">GET</span> /api/predictions/tasks</span>
        <span style="color: #34D399">Task Deadline Risk Model</span>
      </div>
      <div class="route-item">
        <span><span class="method method-get">GET</span> /api/predictions/goals</span>
        <span style="color: #60A5FA">Goal Completion Risk Model</span>
      </div>
    </div>

    <div class="footer">
      LifeOS Personal Operating System Kernel — Designed and Developed by <strong>Ketan Channa</strong>
    </div>
  </div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health Check Endpoint (GET /health & GET /api/health)
app.get(['/health', '/api/health'], async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: dbStatus.connected ? 'ok' : 'degraded',
    service: 'LifeOS Backend Engine',
    version: '1.0.0',
    port: Number(PORT),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Readiness Probe (GET /ready & GET /api/ready)
app.get(['/ready', '/api/ready'], async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    res.status(200).json({ status: 'ready', database: 'connected', service: 'LifeOS Backend Engine' });
  } else {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', error: dbStatus.message });
  }
});

// Auth, Payment & LifeOS Module Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/predictions', aiLimiter, predictionRoutes);
app.use('/api/ai-plans', aiLimiter, aiPlanRoutes);
app.use('/api/knowledge', knowledgeLimiter, knowledgeRoutes);
app.use('/api/scout', aiLimiter, scoutRoutes);
app.use('/api/agent', aiLimiter, agentRoutes);
app.use('/api/notifications', notificationRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Endpoint not found' } });
});

// Centralized Production Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: isProd && statusCode === 500 
        ? 'An internal error occurred. Please try again later.' 
        : err.message || 'Internal Server Error'
    }
  });
});

app.listen(PORT, () => {
  console.log(``);
  console.log(`=======================================================`);
  console.log(`🚀 LifeOS Platform Kernel v1.0.0 (Phase 13 Production Engine) is RUNNING!`);
  console.log(`-------------------------------------------------------`);
  console.log(`➜ Local Status Dashboard:  http://localhost:${PORT}/`);
  console.log(`➜ Health Check JSON API:   http://localhost:${PORT}/api/health`);
  console.log(`➜ Readiness Probe Endpoint: http://localhost:${PORT}/api/ready`);
  console.log(`➜ Frontend Client App:     ${CLIENT_URL}/`);
  console.log(`➜ Running on Port:         ${PORT}`);
  console.log(`➜ Environment:             ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
  console.log(``);
});
