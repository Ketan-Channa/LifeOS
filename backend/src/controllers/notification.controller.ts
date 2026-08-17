import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/errors';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const result = await NotificationService.getNotifications(userId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch notifications', err.statusCode || 500);
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const result = await NotificationService.getUnreadCount(userId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch unread count', err.statusCode || 500);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const id = req.params.id as string;
      const result = await NotificationService.markAsRead(userId, id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to mark notification as read', err.statusCode || 400);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const result = await NotificationService.markAllAsRead(userId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to mark all as read', err.statusCode || 500);
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const id = req.params.id as string;
      const result = await NotificationService.deleteNotification(userId, id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete notification', err.statusCode || 400);
    }
  }

  static async clearNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const result = await NotificationService.clearNotifications(userId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to clear notifications', err.statusCode || 500);
    }
  }
}
