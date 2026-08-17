import { api } from './api';
import { TaskItem, TaskFilterParams, TaskStats, TaskHistoryItem } from '../../../shared/types/lifeos.types';

export const getTasks = async (params?: TaskFilterParams): Promise<TaskItem[]> => {
  const query = new URLSearchParams();

  if (params) {
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.category) query.append('category', params.category);
    if (params.deadline) query.append('deadline', params.deadline);
    if (params.energy) query.append('energy', params.energy);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  }

  const queryString = query.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';
  const res: any = await api.get(url);
  return res.data;
};

export const getTaskStats = async (): Promise<TaskStats> => {
  const res: any = await api.get('/tasks/stats');
  return res.data;
};

export const getTaskById = async (id: string): Promise<TaskItem> => {
  const res: any = await api.get(`/tasks/${id}`);
  return res.data;
};

export const createTask = async (data: Partial<TaskItem>): Promise<TaskItem> => {
  const res: any = await api.post('/tasks', data);
  return res.data;
};

export const updateTask = async (id: string, data: Partial<TaskItem>): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}`, data);
  return res.data;
};

export const startTask = async (id: string): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/start`);
  return res.data;
};

export const pauseTask = async (id: string, elapsedMinutes?: number): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/pause`, { elapsedMinutes });
  return res.data;
};

export const resumeTask = async (id: string): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/resume`);
  return res.data;
};

export const toggleCompleteTask = async (id: string): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/complete`);
  return res.data;
};

export const completeTask = async (id: string, finalActualMinutes?: number): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/complete`, { finalActualMinutes });
  return res.data;
};

export const postponeTask = async (id: string, newDueDate: string): Promise<TaskItem> => {
  const res: any = await api.patch(`/tasks/${id}/postpone`, { newDueDate });
  return res.data;
};

export const getTaskHistory = async (id: string): Promise<TaskHistoryItem[]> => {
  const res: any = await api.get(`/tasks/${id}/history`);
  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
