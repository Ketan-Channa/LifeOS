import prisma from '../config/prisma';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

async function postToPython(endpoint: string, payload: any) {
  const res = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Python service status ${res.status}`);
  return await res.json();
}

export class PredictionService {
  static async getPredictionsOverview(userId: string) {
    const tasks = await prisma.task.findMany({ where: { userId } });
    const goals = await prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } });
    const scheduleEvents = await prisma.scheduleEvent.findMany({ where: { userId } });

    try {
      return await postToPython('/ml/predict/overview', { tasks, goals, scheduleEvents });
    } catch (error) {
      return {
        available: false,
        reason: 'Python ML service unavailable.',
        highRiskTasksCount: 0,
        mediumRiskTasksCount: 0,
        highRiskGoalsCount: 0,
        tomorrowWorkloadRisk: 'NORMAL',
        tomorrowProductivityForecast: 75,
        modelsLoaded: []
      };
    }
  }

  static async getTaskRisk(userId: string, taskId?: string) {
    const userTasks = await prisma.task.findMany({ where: { userId } });

    let targetTask = null;
    if (taskId) {
      targetTask = userTasks.find(t => t.id === taskId);
    } else {
      targetTask = userTasks.find(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
    }

    if (!targetTask) {
      return { available: false, reason: 'No task available for risk prediction.' };
    }

    try {
      return await postToPython('/ml/predict/task-risk', {
        task: targetTask,
        userTasks
      });
    } catch (error) {
      return { available: false, reason: 'ML task risk prediction endpoint offline.' };
    }
  }

  static async getGoalRisk(userId: string, goalId?: string) {
    const userGoals = await prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } });
    const userTasks = await prisma.task.findMany({ where: { userId } });

    let targetGoal = null;
    if (goalId) {
      targetGoal = userGoals.find(g => g.id === goalId);
    } else {
      targetGoal = userGoals[0] || null;
    }

    if (!targetGoal) {
      return { available: false, reason: 'No active goal available for prediction.' };
    }

    try {
      return await postToPython('/ml/predict/goal-risk', {
        goal: targetGoal,
        linkedTasks: userTasks.filter(t => t.goalId === targetGoal.id)
      });
    } catch (error) {
      return { available: false, reason: 'ML goal prediction endpoint offline.' };
    }
  }

  static async getProductivityForecast(userId: string) {
    try {
      return await postToPython('/ml/predict/productivity', { currentScore: 78 });
    } catch (error) {
      return { available: false, reason: 'ML productivity forecast endpoint offline.' };
    }
  }

  static async getWorkloadPrediction(userId: string) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const eventsTomorrow = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        startTime: { gte: startOfTomorrow, lte: endOfTomorrow }
      }
    });

    let scheduledHours = 0;
    eventsTomorrow.forEach(e => {
      const duration = (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60 * 60);
      scheduledHours += duration;
    });

    try {
      return await postToPython('/ml/predict/workload', {
        scheduledHours: scheduledHours || 5.5,
        capacityHours: 6.0
      });
    } catch (error) {
      return { available: false, reason: 'ML workload prediction endpoint offline.' };
    }
  }
}
