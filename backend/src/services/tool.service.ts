import prisma from '../config/prisma';

export class ToolService {
  /**
   * Controlled Backend Tool Execution Layer for SCOUT Agent
   */

  // --- READ TOOLS ---
  static async getTasks(userId: string, filter: any = {}) {
    const where: any = { userId };
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    return prisma.task.findMany({ where, orderBy: { dueDate: 'asc' } });
  }

  static async getGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      include: { milestones: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getSchedule(userId: string, dateStr?: string) {
    const where: any = { userId };
    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    }
    return prisma.scheduleEvent.findMany({ where, orderBy: { startTime: 'asc' } });
  }

  static async getHabits(userId: string) {
    return prisma.habit.findMany({
      where: { userId },
      include: { habitLogs: { orderBy: { date: 'desc' }, take: 7 } }
    });
  }

  // --- WRITE TOOLS (Invoked ONLY after user confirmation) ---
  static async createTask(userId: string, params: any) {
    if (!params.title) throw new Error("Task title is required.");
    return prisma.task.create({
      data: {
        userId,
        title: params.title,
        description: params.description || null,
        priority: params.priority || 'MEDIUM',
        estimatedMinutes: Number(params.estimatedMinutes) || Number(params.estimatedDuration) || 60,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
        status: 'TODO'
      }
    });
  }

  static async updateTask(userId: string, params: any) {
    const { taskId, ...updateData } = params;
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) throw new Error("Task not found or access denied.");

    return prisma.task.update({
      where: { id: taskId },
      data: updateData
    });
  }

  static async completeTask(userId: string, taskId: string) {
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) throw new Error("Task not found or access denied.");

    return prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });
  }

  static async postponeTask(userId: string, params: any) {
    const { taskId, newDueDate } = params;
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) throw new Error("Task not found or access denied.");

    const parsedDate = newDueDate === 'Tomorrow' ? new Date(Date.now() + 86400000) : new Date(newDueDate);

    return prisma.task.update({
      where: { id: taskId },
      data: { dueDate: parsedDate }
    });
  }

  static async createScheduleEvent(userId: string, params: any) {
    if (!params.title || !params.startTime || !params.endTime) {
      throw new Error("Event title, startTime, and endTime are required.");
    }

    const start = new Date(params.startTime);
    const end = new Date(params.endTime);

    // Revalidate constraint: check for existing conflict
    const existingConflicts = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        OR: [
          { startTime: { lte: start }, endTime: { gt: start } },
          { startTime: { lt: end }, endTime: { gte: end } }
        ]
      }
    });

    if (existingConflicts.length > 0) {
      throw new Error(`Schedule conflict detected with '${existingConflicts[0].title}' (${existingConflicts[0].startTime.toISOString()}-${existingConflicts[0].endTime.toISOString()}).`);
    }

    return prisma.scheduleEvent.create({
      data: {
        userId,
        title: params.title,
        startTime: start,
        endTime: end
      }
    });
  }

  static async createGoal(userId: string, params: any) {
    if (!params.title) throw new Error("Goal title is required.");
    return prisma.goal.create({
      data: {
        userId,
        title: params.title,
        description: params.description || null,
        category: params.category || 'Personal',
        targetDate: params.targetDate ? new Date(params.targetDate) : null,
        status: 'ACTIVE',
        progress: 0
      }
    });
  }
}
