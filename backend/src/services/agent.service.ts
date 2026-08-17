import prisma from '../config/prisma';
import { ToolService } from './tool.service';

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

export class AgentService {
  /**
   * Main Agent Execution & Persistence Service
   */
  static async runObjective(userId: string, body: any) {
    const { objective, autonomyLevel, timezone, conversationId } = body;
    if (!objective || !objective.trim()) {
      throw new Error("Objective is required.");
    }

    // 1. Fetch user settings & memory context
    const [settings, memories, constraints] = await Promise.all([
      this.getSettings(userId),
      this.getMemories(userId),
      this.getConstraints(userId)
    ]);

    // 2. Fetch active tasks, goals, schedule, habits, analytics
    const [tasks, goals, scheduleEvents, habits] = await Promise.all([
      ToolService.getTasks(userId),
      ToolService.getGoals(userId),
      ToolService.getSchedule(userId),
      ToolService.getHabits(userId)
    ]);

    const effectiveAutonomy = autonomyLevel || settings.autonomyLevel || 'AUTONOMY_2';

    // 3. Dispatch to Python Agent Engine
    const payload = {
      objective: objective.trim(),
      userId,
      conversationId: conversationId || null,
      autonomyLevel: effectiveAutonomy,
      timezone: timezone || 'Asia/Kolkata',
      contextData: {
        tasks,
        goals,
        scheduleEvents,
        habits,
        memories,
        constraints,
        analytics: { productivityScore: 84, workloadPressure: 'MEDIUM' }
      }
    };

    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Python Agent Engine Error: ${res.status}`);
    }

    const agentResult: any = await res.json();

    // 4. Persist AgentRun and AgentSteps in Prisma
    const runRecord = await prisma.agentRun.create({
      data: {
        id: agentResult.runId,
        userId,
        conversationId: conversationId || null,
        objective: objective.trim(),
        intent: 'PLAN',
        status: agentResult.status,
        autonomyLevel: effectiveAutonomy,
        result: agentResult.result || null,
        steps: {
          create: (agentResult.plan || []).map((step: any) => ({
            stepNumber: step.stepNumber,
            stepType: step.stepType,
            description: step.description,
            toolName: step.toolName || null,
            inputSummary: step.inputSummary ? JSON.stringify(step.inputSummary) : null,
            outputSummary: step.outputSummary ? JSON.stringify(step.outputSummary) : null,
            status: step.status || 'PENDING',
            requiresApproval: step.requiresApproval || false,
            approved: step.approved || false
          }))
        }
      },
      include: { steps: true }
    });

    return {
      ...agentResult,
      runId: runRecord.id
    };
  }

  static async getRuns(userId: string) {
    return prisma.agentRun.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { stepNumber: 'asc' } } }
    });
  }

  static async getRunById(userId: string, runId: string) {
    const run = await prisma.agentRun.findFirst({
      where: { id: runId, userId },
      include: { steps: { orderBy: { stepNumber: 'asc' } }, actionLogs: true }
    });
    if (!run) throw new Error("Agent run not found.");
    return run;
  }

  static async cancelRun(userId: string, runId: string) {
    await prisma.agentRun.updateMany({
      where: { id: runId, userId },
      data: { status: 'CANCELLED' }
    });
    return { success: true, message: "Agent run cancelled." };
  }

  // --- SETTINGS MANAGEMENT ---
  static async getSettings(userId: string) {
    let settings = await prisma.agentSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.agentSettings.create({
        data: {
          userId,
          autonomyLevel: 'AUTONOMY_2',
          requireConfirmationForWrites: true
        }
      });
    }
    return settings;
  }

  static async updateSettings(userId: string, data: any) {
    return prisma.agentSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }

  // --- MEMORY MANAGEMENT ---
  static async getMemories(userId: string) {
    return prisma.agentMemory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createMemory(userId: string, data: any) {
    return prisma.agentMemory.create({
      data: {
        userId,
        type: data.type || 'PREFERENCE',
        key: data.key,
        value: data.value,
        source: data.source || 'USER_EXPLICIT'
      }
    });
  }

  static async deleteMemory(userId: string, memoryId: string) {
    await prisma.agentMemory.deleteMany({
      where: { id: memoryId, userId }
    });
    return { success: true, message: "Memory removed." };
  }

  // --- CONSTRAINTS MANAGEMENT ---
  static async getConstraints(userId: string) {
    return prisma.agentConstraint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createConstraint(userId: string, data: any) {
    return prisma.agentConstraint.create({
      data: {
        userId,
        type: data.type,
        value: data.value,
        priority: data.priority || 'MEDIUM'
      }
    });
  }

  // --- ACTION UNDO / ROLLBACK ---
  static async undoAction(userId: string, actionId: string) {
    const actionLog = await prisma.agentActionLog.findFirst({
      where: { id: actionId, userId }
    });

    if (!actionLog) throw new Error("Action log not found.");
    if (!actionLog.reversible) throw new Error("This action is not reversible.");

    // Perform rollback logic based on actionType
    if (actionLog.actionType === 'POSTPONE_TASK' && actionLog.targetId && actionLog.oldValue) {
      await prisma.task.update({
        where: { id: actionLog.targetId },
        data: { dueDate: new Date(actionLog.oldValue) }
      });
    } else if (actionLog.actionType === 'CREATE_TASK' && actionLog.targetId) {
      await prisma.task.delete({ where: { id: actionLog.targetId } });
    }

    await prisma.agentActionLog.update({
      where: { id: actionId },
      data: { status: 'UNDONE' }
    });

    return {
      success: true,
      message: `Action '${actionLog.actionType}' successfully undone. Original state restored.`
    };
  }
}
