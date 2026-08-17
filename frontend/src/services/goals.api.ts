import { api } from './api';
import { GoalItem, GoalStats, GoalFilterParams, GoalHistoryItem } from '../../../shared/types/lifeos.types';

export const getGoals = async (params?: GoalFilterParams): Promise<GoalItem[]> => {
  const query = new URLSearchParams();

  if (params) {
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  }

  const queryString = query.toString();
  const url = queryString ? `/goals?${queryString}` : '/goals';
  const res: any = await api.get(url);
  return res.data;
};

export const getGoalStats = async (): Promise<GoalStats> => {
  const res: any = await api.get('/goals/stats');
  return res.data;
};

export const getGoalById = async (id: string): Promise<GoalItem> => {
  const res: any = await api.get(`/goals/${id}`);
  return res.data;
};

export const createGoal = async (data: Partial<GoalItem>): Promise<GoalItem> => {
  const res: any = await api.post('/goals', data);
  return res.data;
};

export const updateGoal = async (id: string, data: Partial<GoalItem>): Promise<GoalItem> => {
  const res: any = await api.patch(`/goals/${id}`, data);
  return res.data;
};

export const updateGoalProgress = async (id: string, progress: number): Promise<GoalItem> => {
  const res: any = await api.patch(`/goals/${id}/progress`, { progress });
  return res.data;
};

export const completeGoal = async (id: string): Promise<GoalItem> => {
  const res: any = await api.patch(`/goals/${id}/complete`);
  return res.data;
};

export const pauseGoal = async (id: string): Promise<GoalItem> => {
  const res: any = await api.patch(`/goals/${id}/pause`);
  return res.data;
};

export const archiveGoal = async (id: string): Promise<GoalItem> => {
  const res: any = await api.patch(`/goals/${id}/archive`);
  return res.data;
};

export const getGoalHistory = async (id: string): Promise<GoalHistoryItem[]> => {
  const res: any = await api.get(`/goals/${id}/history`);
  return res.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  await api.delete(`/goals/${id}`);
};
