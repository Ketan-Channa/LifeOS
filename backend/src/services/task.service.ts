import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

export class TaskService {
  static async getTasks(userId: string, filters: any = {}) {
    const where: any = { userId };

    if (filters.goalId) {
      where.goalId = filters.goalId;
    }

    if (filters.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }

    // Category filter
    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    // Energy filter
    if (filters.energy && filters.energy !== 'ALL') {
      where.energyLevel = filters.energy;
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { category: { contains: query } }
      ];
    }

    // Deadline filter
    if (filters.deadline && filters.deadline !== 'ALL') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (filters.deadline === 'TODAY') {
        where.dueDate = {
          gte: startOfToday,
          lte: endOfToday
        };
      } else if (filters.deadline === 'TOMORROW') {
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const endOfTomorrow = new Date(endOfToday);
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
        where.dueDate = {
          gte: startOfTomorrow,
          lte: endOfTomorrow
        };
      } else if (filters.deadline === 'THIS_WEEK') {
        const endOfWeek = new Date(startOfToday);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        where.dueDate = {
          gte: startOfToday,
          lte: endOfWeek
        };
      } else if (filters.deadline === 'OVERDUE') {
        where.dueDate = { lte: now };
        where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
      }
    }

    // Sorting
    let orderBy: any[] = [{ dueDate: 'asc' }, { priority: 'desc' }];
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'desc' : 'asc';
      orderBy = [{ [filters.sortBy]: order }];
    }

    return await prisma.task.findMany({
      where,
      orderBy,
      include: {
        goal: true,
        taskHistories: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }

  static async getTaskStats(userId: string) {
    const allTasks = await prisma.task.findMany({
      where: { userId },
      include: {
        taskHistories: true
      }
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const totalTasks = allTasks.length;
    const completedTasksList = allTasks.filter(t => t.status === 'COMPLETED');
    const completedTasks = completedTasksList.length;
    const pendingTasks = allTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;

    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now && t.status !== 'COMPLETED' && t.status !== 'CANCELLED';
    }).length;

    const dueToday = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfToday && d <= endOfToday;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

    // Averages
    const avgEst = completedTasksList.length > 0
      ? Math.round(completedTasksList.reduce((acc, t) => acc + t.estimatedMinutes, 0) / completedTasksList.length)
      : totalTasks > 0
      ? Math.round(allTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0) / totalTasks)
      : 0;

    const avgAct = completedTasksList.length > 0
      ? Math.round(completedTasksList.reduce((acc, t) => acc + (t.actualMinutes || t.estimatedMinutes), 0) / completedTasksList.length)
      : 0;

    // Delay calculation for completed tasks that had due dates
    let totalDelayMinutes = 0;
    let delayedCount = 0;
    completedTasksList.forEach(t => {
      if (t.dueDate && t.completedAt) {
        const due = new Date(t.dueDate).getTime();
        const comp = new Date(t.completedAt).getTime();
        if (comp > due) {
          totalDelayMinutes += Math.round((comp - due) / (1000 * 60));
          delayedCount++;
        }
      }
    });
    const averageDelayMinutes = delayedCount > 0 ? Math.round(totalDelayMinutes / delayedCount) : 0;

    // Postponed count & category telemetry
    const postponedTasksList = allTasks.filter(t => t.taskHistories.some(h => h.action === 'POSTPONED'));
    const postponedTasks = postponedTasksList.length;

    const categoryPostponeCounts: Record<string, number> = {};
    postponedTasksList.forEach(t => {
      categoryPostponeCounts[t.category] = (categoryPostponeCounts[t.category] || 0) + 1;
    });

    let mostPostponedCategory: string | null = null;
    let maxPostpones = 0;
    Object.entries(categoryPostponeCounts).forEach(([cat, cnt]) => {
      if (cnt > maxPostpones) {
        maxPostpones = cnt;
        mostPostponedCategory = cat;
      }
    });

    // Estimation error percentage formula
    const estimationErrorPercentage = (avgEst > 0 && avgAct > 0)
      ? Math.round(((avgAct - avgEst) / avgEst) * 100)
      : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dueToday,
      completionRate,
      averageEstimatedMinutes: avgEst,
      averageActualMinutes: avgAct,
      averageDelayMinutes,
      postponedTasks,
      estimationErrorPercentage,
      mostPostponedCategory
    };
  }

  static async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        goal: true,
        taskHistories: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  static async createTask(userId: string, data: any) {
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;
    const scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : null;
    const scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : null;

    const task = await prisma.task.create({
      data: {
        userId,
        goalId: data.goalId || null,
        milestoneId: data.milestoneId || null,
        title: data.title.trim(),
        description: data.description || null,
        category: data.category || 'General',
        priority: data.priority || 'MEDIUM',
        status: data.status || 'TODO',
        dueDate,
        estimatedMinutes: Number(data.estimatedMinutes) || 30,
        actualMinutes: Number(data.actualMinutes) || 0,
        energyLevel: data.energyLevel || 'MEDIUM',
        scheduledStart,
        scheduledEnd,
        taskHistories: {
          create: {
            action: 'CREATED',
            newStatus: data.status || 'TODO',
            newDueDate: dueDate
          }
        }
      },
      include: {
        goal: true,
        taskHistories: true
      }
    });

    return task;
  }

  static async updateTask(userId: string, taskId: string, data: any) {
    const existing = await this.getTaskById(userId, taskId);

    const dueDate = data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : existing.dueDate;
    const goalId = data.goalId !== undefined ? (data.goalId || null) : existing.goalId;
    const milestoneId = data.milestoneId !== undefined ? (data.milestoneId || null) : existing.milestoneId;
    const isPriorityChanged = data.priority && data.priority !== existing.priority;

    const action = isPriorityChanged ? 'PRIORITY_CHANGED' : 'EDITED';

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        goalId,
        milestoneId,
        dueDate
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action,
        previousStatus: existing.status,
        newStatus: updated.status,
        previousDueDate: existing.dueDate,
        newDueDate: updated.dueDate
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async startTask(userId: string, taskId: string) {
    const existing = await this.getTaskById(userId, taskId);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: existing.startedAt || new Date()
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'STARTED',
        previousStatus: existing.status,
        newStatus: 'IN_PROGRESS'
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async pauseTask(userId: string, taskId: string, elapsedMinutes?: number) {
    const existing = await this.getTaskById(userId, taskId);

    const additionalMins = elapsedMinutes && elapsedMinutes > 0 ? Math.round(elapsedMinutes) : 0;
    const updatedMinutes = existing.actualMinutes + additionalMins;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        actualMinutes: updatedMinutes
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'PAUSED',
        previousStatus: existing.status,
        newStatus: existing.status
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async resumeTask(userId: string, taskId: string) {
    const existing = await this.getTaskById(userId, taskId);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS'
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'RESUMED',
        previousStatus: existing.status,
        newStatus: 'IN_PROGRESS'
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async toggleCompleteTask(userId: string, taskId: string) {
    const existing = await this.getTaskById(userId, taskId);
    const newStatus = existing.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    if (newStatus === 'COMPLETED') {
      return this.completeTask(userId, taskId);
    } else {
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'TODO',
          completedAt: null
        }
      });

      await prisma.taskHistory.create({
        data: {
          taskId,
          action: 'REOPENED',
          previousStatus: existing.status,
          newStatus: 'TODO'
        }
      });

      return this.getTaskById(userId, taskId);
    }
  }

  static async completeTask(userId: string, taskId: string, finalActualMinutes?: number) {
    const existing = await this.getTaskById(userId, taskId);
    const actualMinutes = finalActualMinutes !== undefined && finalActualMinutes > 0
      ? Math.round(finalActualMinutes)
      : existing.actualMinutes > 0
      ? existing.actualMinutes
      : existing.estimatedMinutes;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualMinutes
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'COMPLETED',
        previousStatus: existing.status,
        newStatus: 'COMPLETED'
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async postponeTask(userId: string, taskId: string, newDueDateStr: string) {
    const existing = await this.getTaskById(userId, taskId);
    const newDueDate = new Date(newDueDateStr);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        dueDate: newDueDate
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        action: 'POSTPONED',
        previousStatus: existing.status,
        newStatus: existing.status,
        previousDueDate: existing.dueDate,
        newDueDate
      }
    });

    return this.getTaskById(userId, taskId);
  }

  static async getTaskHistory(userId: string, taskId: string) {
    await this.getTaskById(userId, taskId);

    return await prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' }
    });
  }

  static async deleteTask(userId: string, taskId: string) {
    await this.getTaskById(userId, taskId);

    await prisma.task.delete({
      where: { id: taskId }
    });
  }
}
