import { api } from './api';
import { MultiPlanGenerationResponse, CandidatePlanData } from '../../../shared/types/lifeos.types';

export const generateAIPlans = async (payload: any): Promise<MultiPlanGenerationResponse> => {
  const res: any = await api.post('/ai-plans/generate', payload);
  return res.data;
};

export const applyAIPlan = async (date: string, selectedPlan: CandidatePlanData): Promise<any> => {
  const res: any = await api.post('/ai-plans/apply', { date, selectedPlan });
  return res;
};

export const getAIPlanHistory = async (): Promise<any[]> => {
  const res: any = await api.get('/ai-plans/history');
  return res.data;
};

export const downloadPlanPDF = async (date: string, plan: CandidatePlanData): Promise<void> => {
  const payload = {
    planId: plan.planId,
    date,
    planName: plan.planName,
    overallScore: plan.overallScore,
    totalScheduledHours: plan.totalScheduledHours,
    freeHoursRemaining: plan.freeHoursRemaining,
    scheduleBlocks: plan.scheduleBlocks,
    scoreBreakdown: plan.scoreBreakdown,
    whyThisPlanReasons: plan.whyThisPlanReasons,
    aiExplanation: plan.aiExplanation
  };

  // Use api axios instance with responseType 'blob' to get auth header and baseURL automatically
  const blobData: any = await api.post('/ai-plans/pdf', payload, {
    responseType: 'blob'
  });

  const blob = new Blob([blobData], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LifeOS_AI_Plan_${date}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
