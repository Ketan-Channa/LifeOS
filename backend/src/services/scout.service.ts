import prisma from '../config/prisma';
import { ToolService } from './tool.service';

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

export class ScoutService {
  /**
   * Main SCOUT Agent Service
   */
  static async sendChatMessage(userId: string, body: any) {
    const { message, conversationId, timezone } = body;
    if (!message || !message.trim()) {
      throw new Error("Message text is required.");
    }

    // 1. Ensure Conversation Record
    let convId = conversationId;
    if (!convId) {
      const newConv = await prisma.scoutConversation.create({
        data: {
          userId,
          title: message.length > 30 ? `${message.substring(0, 30)}...` : message
        }
      });
      convId = newConv.id;
    }

    // Save User Message
    await prisma.scoutMessage.create({
      data: {
        conversationId: convId,
        userId,
        role: 'USER',
        content: message.trim()
      }
    });

    // 2. Gather LifeOS Telemetry Context
    const [tasks, goals, scheduleEvents, habits] = await Promise.all([
      ToolService.getTasks(userId),
      ToolService.getGoals(userId),
      ToolService.getSchedule(userId),
      ToolService.getHabits(userId)
    ]);

    // Fetch conversation message history (last 6 messages)
    const recentMessages = await prisma.scoutMessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
      take: 6
    });

    const historyPayload = recentMessages.map(m => ({
      role: m.role.toLowerCase(),
      content: m.content,
      intent: m.intent
    }));

    // 3. Invoke Python FastAPI SCOUT Agent microservice
    const payload = {
      message: message.trim(),
      conversationId: convId,
      userId,
      timezone: timezone || 'Asia/Kolkata',
      history: historyPayload,
      tasks,
      goals,
      scheduleEvents,
      habits,
      analytics: { productivityScore: 82, workloadPressure: 'LOW' }
    };

    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/scout/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SCOUT AI Service Error: ${response.status}`);
    }

    const scoutResult: any = await response.json();

    // Save Assistant Response in Prisma
    await prisma.scoutMessage.create({
      data: {
        conversationId: convId,
        userId,
        role: 'ASSISTANT',
        content: scoutResult.answer,
        intent: scoutResult.intent,
        sources: scoutResult.sources ? JSON.stringify(scoutResult.sources) : null,
        actions: scoutResult.actions ? JSON.stringify(scoutResult.actions) : null
      }
    });

    return {
      ...scoutResult,
      conversationId: convId
    };
  }

  static async getConversations(userId: string) {
    return prisma.scoutConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } }
      }
    });
  }

  static async getConversationById(userId: string, conversationId: string) {
    const conv = await prisma.scoutConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        toolExecutions: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!conv) throw new Error("Conversation not found.");
    return conv;
  }

  static async createConversation(userId: string, title?: string) {
    return prisma.scoutConversation.create({
      data: {
        userId,
        title: title || 'New Conversation'
      }
    });
  }

  static async deleteConversation(userId: string, conversationId: string) {
    await prisma.scoutConversation.deleteMany({
      where: { id: conversationId, userId }
    });
    return { success: true, message: "Conversation deleted." };
  }

  static async getBriefing(userId: string) {
    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/scout/briefing?userId=${userId}`);
    if (!res.ok) throw new Error("Briefing service error");
    return res.json();
  }

  static async getWeeklyReview(userId: string) {
    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/scout/weekly-review?userId=${userId}`);
    if (!res.ok) throw new Error("Weekly review service error");
    return res.json();
  }

  static async logPredictionOutcome(userId: string, data: any) {
    return prisma.scoutPredictionOutcome.create({
      data: {
        userId,
        targetType: data.targetType,
        targetId: data.targetId,
        predictedRisk: Number(data.predictedRisk) || 0.0,
        actualOutcome: data.actualOutcome || 'COMPLETED_ON_TIME'
      }
    });
  }
}
