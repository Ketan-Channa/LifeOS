import { api } from './api';
import { HabitItem, HabitLogItem, HabitSummaryStats, RoutineAnalyticsData } from '../../../shared/types/lifeos.types';

export const getHabits = async (params?: Record<string, any>): Promise<HabitItem[]> => {
  const res: any = await api.get('/habits', { params });
  return res.data;
};

export const getHabitById = async (id: string): Promise<HabitItem> => {
  const res: any = await api.get(`/habits/${id}`);
  return res.data;
};

export const createHabit = async (data: Partial<HabitItem>): Promise<HabitItem> => {
  const res: any = await api.post('/habits', data);
  return res.data;
};

export const updateHabit = async (id: string, data: Partial<HabitItem>): Promise<HabitItem> => {
  const res: any = await api.patch(`/habits/${id}`, data);
  return res.data;
};

export const pauseHabit = async (id: string): Promise<HabitItem> => {
  const res: any = await api.patch(`/habits/${id}/pause`);
  return res.data;
};

export const resumeHabit = async (id: string): Promise<HabitItem> => {
  const res: any = await api.patch(`/habits/${id}/resume`);
  return res.data;
};

export const archiveHabit = async (id: string): Promise<HabitItem> => {
  const res: any = await api.patch(`/habits/${id}/archive`);
  return res.data;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await api.delete(`/habits/${id}`);
};

export const logHabit = async (id: string, logData: { date?: string; status?: string; value?: number; notes?: string }): Promise<HabitLogItem> => {
  const res: any = await api.post(`/habits/${id}/logs`, logData);
  return res.data;
};

export const getTodayHabits = async (): Promise<HabitItem[]> => {
  const res: any = await api.get('/habits/logs/today');
  return res.data;
};

export const getWeeklyHabits = async (): Promise<{ weekDates: string[]; habits: HabitItem[] }> => {
  const res: any = await api.get('/habits/logs/week');
  return res.data;
};

export const getMonthlyHeatmap = async (): Promise<Record<string, number>> => {
  const res: any = await api.get('/habits/logs/month');
  return res.data;
};

export const getHabitStats = async (): Promise<HabitSummaryStats> => {
  const res: any = await api.get('/habits/stats');
  return res.data;
};

export const getRoutineAnalytics = async (): Promise<RoutineAnalyticsData> => {
  const res: any = await api.get('/analytics/routines');
  return res.data;
};
