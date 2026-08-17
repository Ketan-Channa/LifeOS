import { api } from './api';
import {
  ScoutStructuredResponse, ScoutConversationItem,
  ScoutBriefingItem, ScoutWeeklyReviewItem, ScoutActionItem
} from '../../../shared/types/lifeos.types';

export const sendScoutChat = async (
  message: string,
  conversationId?: string,
  timezone?: string
): Promise<ScoutStructuredResponse> => {
  const res: any = await api.post('/scout/chat', { message, conversationId, timezone });
  return res;
};

export const getScoutConversations = async (): Promise<ScoutConversationItem[]> => {
  const res: any = await api.get('/scout/conversations');
  return res.data;
};

export const getScoutConversationById = async (id: string): Promise<ScoutConversationItem> => {
  const res: any = await api.get(`/scout/conversations/${id}`);
  return res.data;
};

export const createScoutConversation = async (title?: string): Promise<ScoutConversationItem> => {
  const res: any = await api.post('/scout/conversations', { title });
  return res.data;
};

export const deleteScoutConversation = async (id: string): Promise<any> => {
  const res: any = await api.delete(`/scout/conversations/${id}`);
  return res;
};

export const confirmScoutAction = async (actionId: string, actionPayload: ScoutActionItem): Promise<any> => {
  const res: any = await api.post(`/scout/actions/${actionId}/confirm`, actionPayload);
  return res;
};

export const cancelScoutAction = async (actionId: string): Promise<any> => {
  const res: any = await api.post(`/scout/actions/${actionId}/cancel`);
  return res;
};

export const getScoutBriefing = async (): Promise<ScoutBriefingItem> => {
  const res: any = await api.get('/scout/briefing');
  return res.briefing;
};

export const getScoutWeeklyReview = async (): Promise<ScoutWeeklyReviewItem> => {
  const res: any = await api.get('/scout/weekly-review');
  return res.weeklyReview;
};
