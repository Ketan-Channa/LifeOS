import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

export class HabitService {
  static async getHabits(userId: string, filterParams: any = {}) {
    const { category, search, status, priority } = filterParams;
    let whereClause: any = { userId };

    if (status === 'ACTIVE') {
      whereClause.isActive = true;
    } else if (status === 'PAUSED' || status === 'ARCHIVED') {
      whereClause.isActive = false;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: whereClause,
      include: {
        goal: true,
        habitLogs: {
          where: { date: todayStr }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return habits.map(h => {
      const todayLog = h.habitLogs[0] || null;
      const completedToday = todayLog ? todayLog.status === 'COMPLETED' : false;
      return {
        ...h,
        todayLog,
        completedToday
      };
    });
  }

  static async getHabitById(userId: string, habitId: string) {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        goal: true,
        habitLogs: {
          orderBy: { date: 'desc' },
          take: 90
        },
        habitHistories: {
          orderBy: { timestamp: 'desc' },
          take: 30
        }
      }
    });

    if (!habit || habit.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    return habit;
  }

  static async createHabit(userId: string, data: any) {
    const habit = await prisma.habit.create({
      data: {
        userId,
        goalId: data.goalId || null,
        name: data.name,
        description: data.description,
        category: data.category || 'Health',
        frequency: data.frequency || 'DAILY',
        customDays: data.customDays || null,
        targetValue: data.targetValue ? Number(data.targetValue) : 1.0,
        targetUnit: data.targetUnit || 'session',
        preferredTime: data.preferredTime || null,
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        reminderMinutes: data.reminderMinutes ? Number(data.reminderMinutes) : null,
        isActive: true,
        habitHistories: {
          create: {
            action: 'CREATED',
            metadata: JSON.stringify({ name: data.name, category: data.category })
          }
        }
      },
      include: { goal: true }
    });

    return habit;
  }

  static async updateHabit(userId: string, habitId: string, data: any) {
    const existing = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    let action = 'UPDATED';
    if (data.targetValue !== undefined && Number(data.targetValue) !== existing.targetValue) {
      action = 'TARGET_CHANGED';
    } else if (data.frequency !== undefined && data.frequency !== existing.frequency) {
      action = 'FREQUENCY_CHANGED';
    }

    const updated = await prisma.habit.update({
      where: { id: habitId },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        description: data.description !== undefined ? data.description : existing.description,
        category: data.category !== undefined ? data.category : existing.category,
        frequency: data.frequency !== undefined ? data.frequency : existing.frequency,
        customDays: data.customDays !== undefined ? data.customDays : existing.customDays,
        targetValue: data.targetValue !== undefined ? Number(data.targetValue) : existing.targetValue,
        targetUnit: data.targetUnit !== undefined ? data.targetUnit : existing.targetUnit,
        preferredTime: data.preferredTime !== undefined ? data.preferredTime : existing.preferredTime,
        priority: data.priority !== undefined ? data.priority : existing.priority,
        reminderMinutes: data.reminderMinutes !== undefined ? (data.reminderMinutes ? Number(data.reminderMinutes) : null) : existing.reminderMinutes,
        goalId: data.goalId !== undefined ? data.goalId : existing.goalId,
        habitHistories: {
          create: {
            action,
            metadata: JSON.stringify(data)
          }
        }
      },
      include: { goal: true }
    });

    return updated;
  }

  static async pauseHabit(userId: string, habitId: string) {
    const existing = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    return prisma.habit.update({
      where: { id: habitId },
      data: {
        isActive: false,
        habitHistories: { create: { action: 'PAUSED' } }
      }
    });
  }

  static async resumeHabit(userId: string, habitId: string) {
    const existing = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    return prisma.habit.update({
      where: { id: habitId },
      data: {
        isActive: true,
        habitHistories: { create: { action: 'RESUMED' } }
      }
    });
  }

  static async archiveHabit(userId: string, habitId: string) {
    const existing = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    return prisma.habit.update({
      where: { id: habitId },
      data: {
        isActive: false,
        habitHistories: { create: { action: 'ARCHIVED' } }
      }
    });
  }

  static async deleteHabit(userId: string, habitId: string) {
    const existing = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    await prisma.habit.delete({ where: { id: habitId } });
  }

  static async logHabit(userId: string, habitId: string, logData: any) {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      throw new AppError('Habit not found', 404);
    }

    const dateStr = logData.date || new Date().toISOString().split('T')[0];
    const val = logData.value !== undefined ? Number(logData.value) : habit.targetValue;
    const targetVal = habit.targetValue;

    let status = logData.status || 'COMPLETED';
    if (!logData.status) {
      if (val >= targetVal) status = 'COMPLETED';
      else if (val > 0) status = 'PARTIAL';
      else status = 'MISSED';
    }

    // Upsert habit log
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date: dateStr }
      },
      update: {
        status,
        value: val,
        targetValue: targetVal,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        notes: logData.notes
      },
      create: {
        habitId,
        userId,
        date: dateStr,
        status,
        value: val,
        targetValue: targetVal,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        notes: logData.notes
      }
    });

    // Log history
    await prisma.habitHistory.create({
      data: {
        habitId,
        action: status === 'SKIPPED' ? 'SKIPPED' : 'COMPLETED',
        metadata: JSON.stringify({ date: dateStr, status, value: val })
      }
    });

    // Recalculate streak
    const completedLogs = await prisma.habitLog.findMany({
      where: {
        habitId,
        status: { in: ['COMPLETED', 'PARTIAL'] }
      },
      orderBy: { date: 'desc' }
    });

    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const hasLog = completedLogs.some(l => l.date === str);
      if (hasLog) {
        currentStreak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    const longestStreak = Math.max(habit.longestStreak, currentStreak);

    await prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak, longestStreak }
    });

    return log;
  }

  static async getTodayHabits(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        goal: true,
        habitLogs: { where: { date: todayStr } }
      }
    });

    return habits.map(h => ({
      ...h,
      todayLog: h.habitLogs[0] || null,
      completedToday: h.habitLogs.some(l => l.status === 'COMPLETED')
    }));
  }

  static async getWeeklyHabits(userId: string) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        habitLogs: {
          where: { date: { in: weekDates } }
        }
      }
    });

    return { weekDates, habits };
  }

  static async getMonthlyHeatmap(userId: string) {
    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        status: { in: ['COMPLETED', 'PARTIAL'] }
      },
      select: { date: true, status: true }
    });

    const map: Record<string, number> = {};
    logs.forEach(l => {
      map[l.date] = (map[l.date] || 0) + 1;
    });

    return map;
  }

  static async getHabitStats(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        habitLogs: {
          take: 30,
          orderBy: { date: 'desc' }
        }
      }
    });

    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;

    let completedToday = 0;
    let missedToday = 0;
    let bestCurrentStreak = 0;
    let bestOverallStreak = 0;
    let totalConsistency = 0;

    habits.forEach(h => {
      const todayLog = h.habitLogs.find(l => l.date === todayStr);
      if (todayLog?.status === 'COMPLETED') completedToday++;
      else if (todayLog?.status === 'MISSED') missedToday++;

      if (h.currentStreak > bestCurrentStreak) bestCurrentStreak = h.currentStreak;
      if (h.longestStreak > bestOverallStreak) bestOverallStreak = h.longestStreak;

      const compCount = h.habitLogs.filter(l => l.status === 'COMPLETED').length;
      const consistency = h.habitLogs.length > 0 ? (compCount / h.habitLogs.length) * 100 : 0;
      totalConsistency += consistency;
    });

    const avgConsistency = totalHabits > 0 ? Math.round(totalConsistency / totalHabits) : 0;
    const routineScore = Math.min(100, Math.round(avgConsistency * 0.7 + bestCurrentStreak * 1.5));

    return {
      totalHabits,
      activeHabits,
      completedToday,
      missedToday,
      averageConsistency: avgConsistency,
      bestCurrentStreak,
      bestOverallStreak,
      routineScore
    };
  }
}
