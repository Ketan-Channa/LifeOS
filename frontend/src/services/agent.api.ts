import { api } from './api';
import {
  AgentRunItem, AgentSettingsItem, AgentMemoryItem, AgentConstraintItem
} from '../../../shared/types/lifeos.types';

export const runAgentObjective = async (
  objective: string,
  autonomyLevel?: string,
  timezone?: string
): Promise<AgentRunItem> => {
  const res: any = await api.post('/agent/run', { objective, autonomyLevel, timezone });
  return res;
};

export const getAgentRuns = async (): Promise<AgentRunItem[]> => {
  const res: any = await api.get('/agent/runs');
  return res.data;
};

export const getAgentRunById = async (id: string): Promise<AgentRunItem> => {
  const res: any = await api.get(`/agent/runs/${id}`);
  return res.data;
};

export const cancelAgentRun = async (id: string): Promise<any> => {
  const res: any = await api.post(`/agent/runs/${id}/cancel`);
  return res;
};

export const getAgentSettings = async (): Promise<AgentSettingsItem> => {
  const res: any = await api.get('/agent/settings');
  return res.data;
};

export const updateAgentSettings = async (settings: Partial<AgentSettingsItem>): Promise<AgentSettingsItem> => {
  const res: any = await api.post('/agent/settings', settings);
  return res.data;
};

export const getAgentMemories = async (): Promise<AgentMemoryItem[]> => {
  const res: any = await api.get('/agent/memories');
  return res.data;
};

export const createAgentMemory = async (memory: Partial<AgentMemoryItem>): Promise<AgentMemoryItem> => {
  const res: any = await api.post('/agent/memories', memory);
  return res.data;
};

export const deleteAgentMemory = async (id: string): Promise<any> => {
  const res: any = await api.delete(`/agent/memories/${id}`);
  return res;
};

export const undoAgentAction = async (actionId: string): Promise<any> => {
  const res: any = await api.post(`/agent/actions/${actionId}/undo`);
  return res;
};
