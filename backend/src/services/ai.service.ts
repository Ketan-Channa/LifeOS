import { AnalyticsService } from './analytics.service';
import prisma from '../config/prisma';

const PYTHON_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

export class AIService {
  private static async postToPython(endpoint: string, payload: any) {
    try {
      const res = await fetch(`${PYTHON_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Python service error status ${res.status}`);
      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async chat(userId: string, message: string, history: any[] = []) {
    const rawPayload = await AnalyticsService.buildPayload(userId, 'last_30_days');
    const analytics = await AnalyticsService.getOverview(userId, 'last_30_days').catch(() => null);
    const scheduleEvents = await prisma.scheduleEvent.findMany({ where: { userId } });

    const payload = {
      userId,
      message,
      conversationHistory: history,
      tasks: rawPayload.tasks,
      goals: rawPayload.goals,
      scheduleEvents,
      analytics
    };

    try {
      const result = await this.postToPython('/ai/chat', payload);
      
      // Log interaction in MySQL database
      await prisma.aIInteraction.create({
        data: {
          userId,
          message,
          response: result.response || ''
        }
      }).catch(() => {});

      return result;
    } catch (err) {
      return {
        success: true,
        response: `SCOUT AI Assistant is running in offline mode. You have ${rawPayload.tasks.length} tasks and ${rawPayload.goals.length} goals recorded.`
      };
    }
  }

  static async getRecommendations(userId: string) {
    const rawPayload = await AnalyticsService.buildPayload(userId, 'last_30_days');
    const analytics = await AnalyticsService.getOverview(userId, 'last_30_days').catch(() => null);

    const payload = {
      userId,
      tasks: rawPayload.tasks,
      goals: rawPayload.goals,
      analytics
    };

    try {
      return await this.postToPython('/ai/recommendations', payload);
    } catch (err) {
      return { available: false, recommendations: [] };
    }
  }

  static async getDailyPlan(userId: string, dateStr?: string) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const dt = new Date(targetDate);
    const startOfDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0);
    const endOfDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59);

    const [tasks, goals, scheduleEvents, habits, analytics] = await Promise.all([
      prisma.task.findMany({
        where: { userId, status: { in: ['TODO', 'IN_PROGRESS'] } },
        include: { goal: true }
      }),
      prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } }),
      prisma.scheduleEvent.findMany({
        where: {
          userId,
          startTime: { gte: startOfDay, lte: endOfDay }
        }
      }),
      prisma.habit.findMany({ where: { userId, isActive: true } }),
      AnalyticsService.getOverview(userId, 'last_30_days').catch(() => null)
    ]);

    const payload = {
      userId,
      date: targetDate,
      tasks,
      goals,
      scheduleEvents,
      habits,
      analytics
    };

    try {
      return await this.postToPython('/ai/daily-plan', payload);
    } catch (err) {
      return { available: false, date: targetDate, scheduleItems: [], reasoning: "AI Daily Planner offline." };
    }
  }

  static async explain(metricType: string, metricValue: any) {
    try {
      return await this.postToPython('/ai/explain', { metricType, metricValue });
    } catch (err) {
      return { success: true, explanation: `Metric ${metricType} is ${metricValue}.` };
    }
  }
}
