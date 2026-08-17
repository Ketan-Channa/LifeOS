import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  static async getOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, currentPlan: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Fetch Tasks
    const allTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    });

    const tasksToday = allTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfDay && d <= endOfDay;
    });

    const completedTodayCount = allTasks.filter((t) => {
      if (t.status !== 'COMPLETED' || !t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= startOfDay && d <= endOfDay;
    }).length;

    const pendingCount = allTasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;

    const overdueCount = allTasks.filter((t) => {
      if (!t.dueDate || t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      return new Date(t.dueDate) < startOfDay;
    }).length;

    // Upcoming Deadlines (Sorted deterministically by proximity and priority)
    const priorityWeight: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    const upcomingDeadlines = allTasks
      .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate)
      .sort((a, b) => {
        const timeA = new Date(a.dueDate!).getTime();
        const timeB = new Date(b.dueDate!).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      })
      .slice(0, 5);

    // Fetch Active Goals
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        }
      },
      take: 4
    });

    // Fetch Habits & Habit Logs
    const habitsList = await prisma.habit.findMany({
      where: { userId },
      include: {
        habitLogs: {
          orderBy: { date: 'desc' },
          take: 7
        }
      }
    });

    const habits = habitsList.map((h) => ({
      ...h,
      completedToday: h.habitLogs.some((log) => log.date === todayStr && log.status === 'COMPLETED')
    }));

    const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;

    // Fetch Today's Schedule Events
    const scheduleEventsToday = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { startTime: 'asc' }
    });

    // Fetch Recent Notes
    const recentNotes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 4
    });

    // Calculate Focus Time Minutes
    const completedTasksToday = allTasks.filter((t) => {
      if (t.status !== 'COMPLETED' || !t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= startOfDay && d <= endOfDay;
    });

    const focusTimeMinutes = completedTasksToday.reduce(
      (sum, t) => sum + (t.actualMinutes > 0 ? t.actualMinutes : t.estimatedMinutes),
      0
    );

    // Productivity Score (Derived deterministically)
    const totalTasksToDate = allTasks.length;
    const totalCompletedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const taskCompletionRatio = totalTasksToDate > 0 ? (totalCompletedTasks / totalTasksToDate) * 60 : 0;
    const habitScore = habits.length > 0 ? (habits.filter((h) => h.completedToday).length / habits.length) * 40 : 0;
    const productivityScore = Math.min(100, Math.round(taskCompletionRatio + habitScore));

    // Weekly Productivity Chart Data (Past 7 Days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const productivityData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = dayNames[d.getDay()];

      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayCompletedTasks = allTasks.filter((t) => {
        if (t.status !== 'COMPLETED' || !t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        return compDate >= dayStart && compDate <= dayEnd;
      });

      const dayFocusMins = dayCompletedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0);

      productivityData.push({
        day: dayName,
        completedTasks: dayCompletedTasks.length,
        focusHours: parseFloat((dayFocusMins / 60).toFixed(1))
      });
    }

    return {
      user,
      stats: {
        productivityScore,
        tasksTodayCount: tasksToday.length,
        focusTimeMinutes,
        activeGoalsCount: goals.length,
        habitStreakDays: maxStreak,
        upcomingDeadlinesCount: upcomingDeadlines.length
      },
      tasks: {
        today: tasksToday,
        completedTodayCount,
        pendingCount,
        overdueCount
      },
      deadlines: upcomingDeadlines,
      goals,
      habits,
      scheduleEventsToday,
      recentNotes,
      productivityData
    };
  }
}
