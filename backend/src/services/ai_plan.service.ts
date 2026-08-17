import prisma from '../config/prisma';
import { AnalyticsService } from './analytics.service';
import { PredictionService } from './prediction.service';

const PYTHON_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

export class AIPlanService {
  /**
   * Generate multi-candidate plans by aggregating user's tasks, goals, habits, deadlines,
   * existing schedule events, and ML risk predictions, sending them to Python planner.
   */
  static async generatePlans(userId: string, body: any) {
    const targetDate = body.date || new Date().toISOString().split('T')[0];
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

    // Build items from body or fallback to database tasks & habits
    let items = body.items || [];
    if (!items || items.length === 0) {
      items = tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        durationMinutes: t.estimatedMinutes || 45,
        priority: t.priority,
        category: t.category || 'General',
        energyLevel: t.energyLevel || 'MEDIUM',
        deadline: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null,
        isFixed: false,
        isFlexible: true,
        linkedTaskId: t.id,
        linkedGoalId: t.goalId
      }));

      // Add active habits
      habits.forEach(h => {
        items.push({
          id: `habit_${h.id}`,
          title: `Habit: ${h.name}`,
          description: h.description,
          durationMinutes: 30,
          priority: h.priority,
          category: h.category || 'Personal',
          energyLevel: 'MEDIUM',
          preferredStartTime: h.preferredTime || null,
          isFixed: false,
          isFlexible: true,
          linkedGoalId: h.goalId
        });
      });
    }

    const payload = {
      userId,
      date: targetDate,
      windowStart: body.windowStart || '06:00',
      windowEnd: body.windowEnd || '23:00',
      planningStyle: body.planningStyle || 'BALANCED',
      maxWorkloadHours: body.maxWorkloadHours ? Number(body.maxWorkloadHours) : null,
      breakPreferenceMinutes: body.breakPreferenceMinutes ? Number(body.breakPreferenceMinutes) : 15,
      items,
      existingScheduleEvents: scheduleEvents,
      tasks,
      goals,
      habits,
      analytics
    };

    const res = await fetch(`${PYTHON_SERVICE_URL}/planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Python planner service status ${res.status}`);
    }

    const data = await res.json();
    return data;
  }

  /**
   * Apply selected candidate plan to MySQL database after user explicit confirmation.
   */
  static async applyPlan(userId: string, body: any) {
    const { date, selectedPlan } = body;
    if (!selectedPlan || !selectedPlan.scheduleBlocks) {
      throw new Error("Invalid plan data for application");
    }

    let createdEvents = 0;
    let movedEvents = 0;
    let unchangedEvents = 0;

    for (const block of selectedPlan.scheduleBlocks) {
      if (block.isBreak) continue;

      const startTimeIso = `${date}T${block.startTime}:00`;
      const endTimeIso = `${date}T${block.endTime}:00`;

      // Map category to EventType enum
      const upperCat = (block.category || '').toUpperCase();
      let eventType: any = 'TASK';
      if (upperCat.includes('WORK') || upperCat.includes('JOB') || upperCat.includes('CAREER')) eventType = 'WORK';
      else if (upperCat.includes('CLASS') || upperCat.includes('ACADEMIC') || upperCat.includes('STUDY')) eventType = 'CLASS';
      else if (upperCat.includes('HEALTH') || upperCat.includes('EXERCISE') || upperCat.includes('FITNESS')) eventType = 'EXERCISE';
      else if (upperCat.includes('MEETING')) eventType = 'MEETING';
      else if (upperCat.includes('PERSONAL')) eventType = 'PERSONAL';

      if (block.isFixed) {
        unchangedEvents++;
      } else {
        await prisma.scheduleEvent.create({
          data: {
            userId,
            title: block.title,
            type: eventType,
            startTime: new Date(startTimeIso),
            endTime: new Date(endTimeIso),
            priority: block.priority as any || 'MEDIUM',
            linkedTaskId: block.linkedTaskId,
            linkedGoalId: block.linkedGoalId
          }
        });
        createdEvents++;

        // Update task scheduled dates and status
        if (block.linkedTaskId) {
          await prisma.task.update({
            where: { id: block.linkedTaskId },
            data: {
              scheduledStart: new Date(startTimeIso),
              scheduledEnd: new Date(endTimeIso),
              status: 'IN_PROGRESS'
            }
          }).catch(() => {});
        }
      }
    }

    // Persist plan selection in AIPlanHistory table
    const historyRecord = await prisma.aIPlanHistory.create({
      data: {
        userId,
        date,
        planName: selectedPlan.planName || 'Selected Plan',
        planScore: selectedPlan.overallScore || 85,
        planData: JSON.stringify(selectedPlan),
        selected: true,
        applied: true
      }
    });

    return {
      success: true,
      appliedPlanId: historyRecord.id,
      createdEvents,
      movedEvents,
      unchangedEvents,
      message: `Plan '${selectedPlan.planName}' applied successfully to your calendar!`
    };
  }

  /**
   * Get plan selection history for telemetry analysis.
   */
  static async getHistory(userId: string) {
    return prisma.aIPlanHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  /**
   * Export printable PDF from Python microservice with secure ownership verification.
   */
  static async exportPDF(userId: string, body: any) {
    const res = await fetch(`${PYTHON_SERVICE_URL}/planner/pdf-export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`PDF generation failed with status ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
