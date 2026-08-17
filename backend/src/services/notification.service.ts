import prisma from '../config/prisma';
import { AppError } from '../utils/errors';

export class NotificationService {
  static async getNotifications(userId: string) {
    // Auto-check for high priority system alerts (e.g. overdue tasks) before returning
    await this.generateSystemAlerts(userId);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return {
      notifications,
      unreadCount
    };
  }

  static async getUnreadCount(userId: string) {
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });
    return { unreadCount };
  }

  static async markAsRead(userId: string, notificationId: string) {
    const record = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!record) throw new AppError('Notification not found', 404);

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    });

    return updated;
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const record = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!record) throw new AppError('Notification not found', 404);

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return { success: true, message: 'Notification deleted' };
  }

  static async clearNotifications(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId }
    });

    return { success: true, message: 'Notification center cleared' };
  }

  static async createNotification(userId: string, payload: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    actionUrl?: string;
    metadata?: any;
  }) {
    return prisma.notification.create({
      data: {
        userId,
        type: payload.type || 'GENERAL',
        title: payload.title,
        message: payload.message,
        priority: payload.priority || 'MEDIUM',
        actionUrl: payload.actionUrl || null,
        metadata: payload.metadata || null
      }
    });
  }

  private static async generateSystemAlerts(userId: string) {
    try {
      const now = new Date();
      // Check overdue tasks that don't have notification yet
      const overdueTasks = await prisma.task.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { lt: now }
        },
        take: 3
      });

      for (const task of overdueTasks) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'TASK_OVERDUE',
            actionUrl: `/tasks?id=${task.id}`
          }
        });

        if (!existing) {
          await this.createNotification(userId, {
            type: 'TASK_OVERDUE',
            title: 'Task Overdue Alert',
            message: `"${task.title}" has passed its scheduled deadline.`,
            priority: 'HIGH',
            actionUrl: '/tasks'
          });
        }
      }
    } catch (e) {
      // Ignore background check errors
    }
  }
}
