import { api } from './api';
import { MilestoneItem } from '../../../shared/types/lifeos.types';

export const getMilestones = async (goalId: string): Promise<MilestoneItem[]> => {
  const res: any = await api.get(`/goals/${goalId}/milestones`);
  return res.data;
};

export const createMilestone = async (goalId: string, data: Partial<MilestoneItem>): Promise<MilestoneItem> => {
  const res: any = await api.post(`/goals/${goalId}/milestones`, data);
  return res.data;
};

export const updateMilestone = async (id: string, data: Partial<MilestoneItem>): Promise<MilestoneItem> => {
  const res: any = await api.patch(`/milestones/${id}`, data);
  return res.data;
};

export const completeMilestone = async (id: string): Promise<MilestoneItem> => {
  const res: any = await api.patch(`/milestones/${id}/complete`);
  return res.data;
};

export const reopenMilestone = async (id: string): Promise<MilestoneItem> => {
  const res: any = await api.patch(`/milestones/${id}/reopen`);
  return res.data;
};

export const reorderMilestones = async (goalId: string, orders: { id: string; order: number }[]): Promise<MilestoneItem[]> => {
  const res: any = await api.patch(`/goals/${goalId}/milestones/reorder`, { orders });
  return res.data;
};

export const deleteMilestone = async (id: string): Promise<void> => {
  await api.delete(`/milestones/${id}`);
};
