import { api } from './api';
import { ScheduleEventItem, ScheduleStats, ScheduleConflict, FreeTimeSlot, ScheduleAdherence } from '../../../shared/types/lifeos.types';

export const getScheduleEvents = async (date?: string): Promise<ScheduleEventItem[]> => {
  const url = date ? `/schedule?date=${date}` : '/schedule';
  const res: any = await api.get(url);
  return res.data;
};

export const getDayEvents = async (date: string): Promise<{ events: ScheduleEventItem[]; scheduledTasks: any[]; deadlines: any[] }> => {
  const res: any = await api.get(`/schedule/day?date=${date}`);
  return res.data;
};

export const getWeekEvents = async (startDate: string): Promise<{ events: ScheduleEventItem[]; scheduledTasks: any[]; deadlines: any[] }> => {
  const res: any = await api.get(`/schedule/week?startDate=${startDate}`);
  return res.data;
};

export const getMonthEvents = async (year: number, month: number): Promise<{ events: ScheduleEventItem[]; deadlines: any[]; milestones: any[] }> => {
  const res: any = await api.get(`/schedule/month?year=${year}&month=${month}`);
  return res.data;
};

export const getScheduleStats = async (): Promise<ScheduleStats> => {
  const res: any = await api.get('/schedule/stats');
  return res.data;
};

export const getScheduleConflicts = async (date?: string): Promise<ScheduleConflict[]> => {
  const url = date ? `/schedule/conflicts?date=${date}` : '/schedule/conflicts';
  const res: any = await api.get(url);
  return res.data;
};

export const getFreeTimeSlots = async (date?: string): Promise<FreeTimeSlot[]> => {
  const url = date ? `/schedule/free-time?date=${date}` : '/schedule/free-time';
  const res: any = await api.get(url);
  return res.data;
};

export const getScheduleAdherence = async (): Promise<ScheduleAdherence> => {
  const res: any = await api.get('/schedule/adherence');
  return res.data;
};

export const createScheduleEvent = async (data: Partial<ScheduleEventItem>): Promise<ScheduleEventItem> => {
  const res: any = await api.post('/schedule', data);
  return res.data;
};

export const updateScheduleEvent = async (id: string, data: Partial<ScheduleEventItem>): Promise<ScheduleEventItem> => {
  const res: any = await api.patch(`/schedule/${id}`, data);
  return res.data;
};

export const deleteScheduleEvent = async (id: string): Promise<void> => {
  await api.delete(`/schedule/${id}`);
};
