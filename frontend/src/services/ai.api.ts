import { api } from './api';
import { AIDailyPlan, AIRecommendationItem } from '../../../shared/types/lifeos.types';

export const sendScoutMessage = async (message: string, conversationHistory: any[] = []): Promise<{ response: string }> => {
  const res: any = await api.post('/ai/chat', { message, conversationHistory });
  return res;
};

export const getAIRecommendations = async (): Promise<AIRecommendationItem[]> => {
  const res: any = await api.get('/ai/recommendations');
  return res.data;
};

export const getAIDailyPlan = async (date?: string): Promise<AIDailyPlan> => {
  const url = date ? `/ai/daily-plan?date=${date}` : '/ai/daily-plan';
  const res: any = await api.get(url);
  return res.data;
};

export const explainMetric = async (metricType: string, metricValue: any): Promise<{ explanation: string }> => {
  const res: any = await api.post('/ai/explain', { metricType, metricValue });
  return res;
};
