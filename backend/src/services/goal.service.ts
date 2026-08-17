import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

export class GoalService {
  static computeGoalMetrics(goal: any) {
    const now = new Date();
    const target = goal.targetDate ? new Date(goal.targetDate) : null;
    const start = goal.startDate ? new Date(goal.startDate) : new Date(goal.createdAt);

    let daysRemaining = 0;
    let isOverdue = false;

    if (target) {
      const diffTime = target.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = diffTime < 0 && goal.status !== 'COMPLETED' && goal.status !== 'ARCHIVED';
    }

    // Goal velocity calculation (% progress per day elapsed)
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const velocity = Math.round((goal.progress / elapsedDays) * 10) / 10;

    // Deterministic Goal Risk Estimate
    let riskEstimate: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (isOverdue) {
      riskEstimate = 'HIGH';
    } else if (target && daysRemaining <= 7 && goal.progress < 50) {
      riskEstimate = 'HIGH';
    } else if (target && daysRemaining <= 14 && goal.progress < 40) {
      riskEstimate = 'MEDIUM';
    }

    return {
      ...goal,
      daysRemaining,
      isOverdue,
      riskEstimate,
      velocity
    };
  }

  static async getGoals(userId: string, filters: any = {}) {
    const where: any = { userId };

    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'OVERDUE') {
        where.targetDate = { lte: new Date() };
        where.status = { notIn: ['COMPLETED', 'ARCHIVED'] };
      } else {
        where.status = filters.status;
      }
    }

    if (filters.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }

    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    if (filters.search && filters.search.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { category: { contains: query } }
      ];
    }

    let orderBy: any[] = [{ targetDate: 'asc' }, { priority: 'desc' }];
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'desc' : 'asc';
      orderBy = [{ [filters.sortBy]: order }];
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy,
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        },
        tasks: true,
        goalHistories: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return goals.map(g => this.computeGoalMetrics(g));
  }

  static async getGoalStats(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: true,
        goalHistories: true
      }
    });

    const now = new Date();
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const pausedGoals = goals.filter(g => g.status === 'PAUSED').length;

    const overdueGoals = goals.filter(g => {
      if (!g.targetDate) return false;
      return new Date(g.targetDate) < now && g.status !== 'COMPLETED' && g.status !== 'ARCHIVED';
    }).length;

    const averageProgress = totalGoals > 0
      ? Math.round((goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) * 10) / 10
      : 0;

    let milestonesTotal = 0;
    let milestonesCompleted = 0;

    goals.forEach(g => {
      milestonesTotal += g.milestones.length;
      milestonesCompleted += g.milestones.filter(m => m.completed).length;
    });

    // Average goal velocity (%/day)
    let totalVelocity = 0;
    goals.forEach(g => {
      const start = g.startDate ? new Date(g.startDate) : new Date(g.createdAt);
      const elapsedDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      totalVelocity += g.progress / elapsedDays;
    });
    const goalVelocity = totalGoals > 0 ? Math.round((totalVelocity / totalGoals) * 10) / 10 : 0;

    // Most active category
    const categoryCounts: Record<string, number> = {};
    goals.forEach(g => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    let mostActiveCategory: string | null = null;
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        mostActiveCategory = cat;
      }
    });

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      pausedGoals,
      overdueGoals,
      averageProgress,
      milestonesCompleted,
      milestonesTotal,
      averageGoalProgress: averageProgress,
      goalVelocity,
      mostActiveCategory
    };
  }

  static async getGoalById(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        },
        tasks: {
          orderBy: { dueDate: 'asc' }
        },
        goalHistories: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    return this.computeGoalMetrics(goal);
  }

  static async createGoal(userId: string, data: any) {
    const targetDate = data.targetDate ? new Date(data.targetDate) : null;
    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: data.title.trim(),
        description: data.description || null,
        category: data.category || 'General',
        priority: data.priority || 'MEDIUM',
        status: data.status || 'ACTIVE',
        startDate,
        targetDate,
        progress: Number(data.progress) || 0,
        goalHistories: {
          create: {
            action: 'CREATED',
            newProgress: Number(data.progress) || 0,
            newStatus: data.status || 'ACTIVE'
          }
        }
      },
      include: {
        milestones: true,
        goalHistories: true
      }
    });

    return this.computeGoalMetrics(goal);
  }

  static async updateGoal(userId: string, goalId: string, data: any) {
    const existing = await this.getGoalById(userId, goalId);

    const targetDate = data.targetDate !== undefined ? (data.targetDate ? new Date(data.targetDate) : null) : existing.targetDate;
    const startDate = data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : existing.startDate) : existing.startDate;
    const isStatusChanged = data.status && data.status !== existing.status;

    const action = isStatusChanged ? 'STATUS_CHANGED' : 'UPDATED';

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...data,
        startDate,
        targetDate
      }
    });

    await prisma.goalHistory.create({
      data: {
        goalId,
        action,
        previousStatus: existing.status,
        newStatus: updated.status,
        previousProgress: existing.progress,
        newProgress: updated.progress
      }
    });

    return this.getGoalById(userId, goalId);
  }

  static async updateProgress(userId: string, goalId: string, newProgress: number) {
    const existing = await this.getGoalById(userId, goalId);
    const progress = Math.min(100, Math.max(0, Math.round(newProgress * 10) / 10));
    const newStatus = progress >= 100 ? 'COMPLETED' : existing.status;

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress,
        status: newStatus
      }
    });

    await prisma.goalHistory.create({
      data: {
        goalId,
        action: 'PROGRESS_CHANGED',
        previousProgress: existing.progress,
        newProgress: progress,
        previousStatus: existing.status,
        newStatus
      }
    });

    return this.getGoalById(userId, goalId);
  }

  static async completeGoal(userId: string, goalId: string) {
    return this.updateProgress(userId, goalId, 100);
  }

  static async pauseGoal(userId: string, goalId: string) {
    return this.updateGoal(userId, goalId, { status: 'PAUSED' });
  }

  static async archiveGoal(userId: string, goalId: string) {
    return this.updateGoal(userId, goalId, { status: 'ARCHIVED' });
  }

  static async getGoalHistory(userId: string, goalId: string) {
    await this.getGoalById(userId, goalId);

    return await prisma.goalHistory.findMany({
      where: { goalId },
      orderBy: { timestamp: 'desc' }
    });
  }

  static async deleteGoal(userId: string, goalId: string) {
    await this.getGoalById(userId, goalId);

    await prisma.goal.delete({
      where: { id: goalId }
    });
  }

  // Recalculate goal progress automatically based on completed milestones
  static async recalculateGoalProgressFromMilestones(goalId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { milestones: true }
    });

    if (!goal || goal.milestones.length === 0) return;

    const total = goal.milestones.length;
    const completed = goal.milestones.filter(m => m.completed).length;
    const newProgress = Math.round((completed / total) * 1000) / 10;
    const newStatus = newProgress >= 100 ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'ACTIVE' : goal.status;

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: newProgress,
        status: newStatus
      }
    });

    await prisma.goalHistory.create({
      data: {
        goalId,
        action: 'PROGRESS_CHANGED',
        previousProgress: goal.progress,
        newProgress,
        previousStatus: goal.status,
        newStatus
      }
    });
  }
}
