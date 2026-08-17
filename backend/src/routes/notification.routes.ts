import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

router.use(authenticateJwt as any);

router.get('/', NotificationController.getNotifications as any);
router.get('/unread', NotificationController.getUnreadCount as any);
router.patch('/read-all', NotificationController.markAllAsRead as any);
router.patch('/:id/read', NotificationController.markAsRead as any);
router.delete('/clear', NotificationController.clearNotifications as any);
router.delete('/:id', NotificationController.deleteNotification as any);

export default router;
