import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

export class ScheduleService {
  static async getEvents(userId: string, dateStr?: string) {
    let whereClause: any = { userId };

    if (dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    return prisma.scheduleEvent.findMany({
      where: whereClause,
      include: {
        linkedTask: true,
        linkedGoal: true,
        scheduleHistories: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  static async getDayEvents(userId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    const events = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        linkedTask: true,
        linkedGoal: true
      },
      orderBy: { startTime: 'asc' }
    });

    const scheduledTasks = await prisma.task.findMany({
      where: {
        userId,
        scheduledStart: { gte: startOfDay, lte: endOfDay }
      },
      include: { goal: true }
    });

    const deadlines = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startOfDay, lte: endOfDay }
      }
    });

    return { events, scheduledTasks, deadlines };
  }

  static async getWeekEvents(userId: string, startDateStr: string) {
    const start = new Date(startDateStr);
    const startOfWeek = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const events = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        startTime: { gte: startOfWeek, lt: endOfWeek }
      },
      include: { linkedTask: true, linkedGoal: true },
      orderBy: { startTime: 'asc' }
    });

    const scheduledTasks = await prisma.task.findMany({
      where: {
        userId,
        scheduledStart: { gte: startOfWeek, lt: endOfWeek }
      }
    });

    const deadlines = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startOfWeek, lt: endOfWeek }
      }
    });

    return { events, scheduledTasks, deadlines };
  }

  static async getMonthEvents(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const events = await prisma.scheduleEvent.findMany({
      where: {
        userId,
        startTime: { gte: startOfMonth, lte: endOfMonth }
      },
      include: { linkedTask: true, linkedGoal: true }
    });

    const deadlines = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const milestones = await prisma.milestone.findMany({
      where: {
        goal: { userId }
      },
      include: { goal: true }
    });

    return { events, deadlines, milestones };
  }

  static async createEvent(userId: string, data: any) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new AppError('Invalid start or end time format', 400);
    }

    if (endTime <= startTime) {
      throw new AppError('End time must be strictly after start time', 400);
    }

    const event = await prisma.scheduleEvent.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type || 'OTHER',
        startTime,
        endTime,
        priority: data.priority || 'MEDIUM',
        location: data.location,
        isAllDay: data.isAllDay || false,
        recurrenceRule: data.recurrenceRule,
        reminderMinutes: data.reminderMinutes ? Number(data.reminderMinutes) : null,
        linkedTaskId: data.linkedTaskId,
        linkedGoalId: data.linkedGoalId,
        scheduleHistories: {
          create: {
            action: 'CREATED',
            newStartTime: startTime,
            newEndTime: endTime
          }
        }
      },
      include: {
        linkedTask: true,
        linkedGoal: true
      }
    });

    if (data.linkedTaskId) {
      await prisma.task.update({
        where: { id: data.linkedTaskId },
        data: {
          scheduledStart: startTime,
          scheduledEnd: endTime,
          status: 'IN_PROGRESS'
        }
      }).catch(() => {});
    }

    return event;
  }

  static async updateEvent(userId: string, eventId: string, data: any) {
    const existing = await prisma.scheduleEvent.findUnique({ where: { id: eventId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Schedule event not found', 404);
    }

    const startTime = data.startTime ? new Date(data.startTime) : existing.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : existing.endTime;

    if (endTime <= startTime) {
      throw new AppError('End time must be strictly after start time', 400);
    }

    let action = 'UPDATED';
    if (data.startTime && new Date(data.startTime).getTime() !== existing.startTime.getTime()) {
      const isResized = data.endTime && (new Date(data.endTime).getTime() - new Date(data.startTime).getTime() !== existing.endTime.getTime() - existing.startTime.getTime());
      action = isResized ? 'RESIZED' : 'MOVED';
    }

    const updated = await prisma.scheduleEvent.update({
      where: { id: eventId },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        type: data.type !== undefined ? data.type : existing.type,
        startTime,
        endTime,
        priority: data.priority !== undefined ? data.priority : existing.priority,
        location: data.location !== undefined ? data.location : existing.location,
        isAllDay: data.isAllDay !== undefined ? data.isAllDay : existing.isAllDay,
        recurrenceRule: data.recurrenceRule !== undefined ? data.recurrenceRule : existing.recurrenceRule,
        reminderMinutes: data.reminderMinutes !== undefined ? (data.reminderMinutes ? Number(data.reminderMinutes) : null) : existing.reminderMinutes,
        linkedTaskId: data.linkedTaskId !== undefined ? data.linkedTaskId : existing.linkedTaskId,
        linkedGoalId: data.linkedGoalId !== undefined ? data.linkedGoalId : existing.linkedGoalId,
        scheduleHistories: {
          create: {
            action,
            previousStartTime: existing.startTime,
            newStartTime: startTime,
            previousEndTime: existing.endTime,
            newEndTime: endTime
          }
        }
      },
      include: {
        linkedTask: true,
        linkedGoal: true
      }
    });

    return updated;
  }

  static async deleteEvent(userId: string, eventId: string) {
    const existing = await prisma.scheduleEvent.findUnique({ where: { id: eventId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Schedule event not found', 404);
    }

    await prisma.scheduleEvent.delete({
      where: { id: eventId }
    });
  }

  static async detectConflicts(userId: string, dateStr: string) {
    const { events, scheduledTasks } = await this.getDayEvents(userId, dateStr);

    const allBlocks: { id: string; title: string; start: Date; end: Date; type: string }[] = [
      ...events.map(e => ({ id: e.id, title: e.title, start: new Date(e.startTime), end: new Date(e.endTime), type: 'EVENT' })),
      ...scheduledTasks.map(t => ({ id: t.id, title: t.title, start: new Date(t.scheduledStart!), end: new Date(t.scheduledEnd!), type: 'TASK' }))
    ];

    const conflicts = [];
    for (let i = 0; i < allBlocks.length; i++) {
      for (let j = i + 1; j < allBlocks.length; j++) {
        const a = allBlocks[i];
        const b = allBlocks[j];

        if (a.start < b.end && b.start < a.end) {
          const overlapStart = new Date(Math.max(a.start.getTime(), b.start.getTime()));
          const overlapEnd = new Date(Math.min(a.end.getTime(), b.end.getTime()));
          const overlapMinutes = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));

          conflicts.push({
            eventA: a,
            eventB: b,
            overlapMinutes
          });
        }
      }
    }

    return conflicts;
  }

  static async detectFreeTime(userId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 6, 0, 0); // 6 AM
    const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 0, 0); // 11 PM

    const { events, scheduledTasks } = await this.getDayEvents(userId, dateStr);

    const busySlots = [
      ...events.map(e => ({ start: new Date(e.startTime), end: new Date(e.endTime) })),
      ...scheduledTasks.map(t => ({ start: new Date(t.scheduledStart!), end: new Date(t.scheduledEnd!) }))
    ].sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlots = [];
    let currentPointer = dayStart;

    for (const slot of busySlots) {
      if (slot.start > currentPointer) {
        const dur = Math.round((slot.start.getTime() - currentPointer.getTime()) / (1000 * 60));
        if (dur >= 30) {
          freeSlots.push({
            startTime: currentPointer.toISOString(),
            endTime: slot.start.toISOString(),
            durationMinutes: dur
          });
        }
      }
      if (slot.end > currentPointer) {
        currentPointer = slot.end;
      }
    }

    if (dayEnd > currentPointer) {
      const dur = Math.round((dayEnd.getTime() - currentPointer.getTime()) / (1000 * 60));
      if (dur >= 30) {
        freeSlots.push({
          startTime: currentPointer.toISOString(),
          endTime: dayEnd.toISOString(),
          durationMinutes: dur
        });
      }
    }

    return freeSlots;
  }

  static async getScheduleAdherence(userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        scheduledStart: { not: null },
        startedAt: { not: null }
      }
    });

    if (tasks.length === 0) {
      return {
        averageStartDelayMinutes: 0,
        averageEndDelayMinutes: 0,
        onTimeStartPercentage: 100
      };
    }

    let totalStartDelayMins = 0;
    let totalEndDelayMins = 0;
    let onTimeStartCount = 0;

    for (const t of tasks) {
      const schedStart = new Date(t.scheduledStart!).getTime();
      const actualStart = new Date(t.startedAt!).getTime();
      const delayMins = (actualStart - schedStart) / (1000 * 60);

      totalStartDelayMins += delayMins;
      if (delayMins <= 15) {
        onTimeStartCount++;
      }

      if (t.scheduledEnd && t.completedAt) {
        const schedEnd = new Date(t.scheduledEnd).getTime();
        const actualEnd = new Date(t.completedAt).getTime();
        totalEndDelayMins += (actualEnd - schedEnd) / (1000 * 60);
      }
    }

    return {
      averageStartDelayMinutes: Math.round(totalStartDelayMins / tasks.length),
      averageEndDelayMinutes: Math.round(totalEndDelayMins / tasks.length),
      onTimeStartPercentage: Math.round((onTimeStartCount / tasks.length) * 100)
    };
  }

  static async getScheduleStats(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const { events, scheduledTasks } = await this.getDayEvents(userId, todayStr);
    const conflicts = await this.detectConflicts(userId, todayStr);
    const freeSlots = await this.detectFreeTime(userId, todayStr);

    let totalScheduledMins = 0;
    events.forEach(e => {
      totalScheduledMins += (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60);
    });
    scheduledTasks.forEach(t => {
      if (t.scheduledStart && t.scheduledEnd) {
        totalScheduledMins += (new Date(t.scheduledEnd).getTime() - new Date(t.scheduledStart).getTime()) / (1000 * 60);
      }
    });

    let totalFreeMins = freeSlots.reduce((acc, slot) => acc + slot.durationMinutes, 0);

    return {
      eventsToday: events.length,
      scheduledHoursToday: Math.round((totalScheduledMins / 60) * 10) / 10,
      freeHoursToday: Math.round((totalFreeMins / 60) * 10) / 10,
      conflictsToday: conflicts.length,
      overloadedDays: totalScheduledMins > 8 * 60 ? 1 : 0,
      averageScheduledHours: 6.5,
      completedScheduledTasks: scheduledTasks.filter(t => t.status === 'COMPLETED').length,
      missedScheduledTasks: scheduledTasks.filter(t => t.status !== 'COMPLETED').length
    };
  }
}
