import { api } from './api';
import { NotificationItem } from '../../../shared/types/lifeos.types';

export const getNotifications = async (): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
  const res: any = await api.get('/notifications');
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res: any = await api.get('/notifications/unread');
  return res.data?.unreadCount || 0;
};

export const markNotificationAsRead = async (id: string): Promise<NotificationItem> => {
  const res: any = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const clearNotifications = async (): Promise<void> => {
  await api.delete('/notifications/clear');
};
