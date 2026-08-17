import { api } from './api';
import { AnalyticsOverviewData } from '../../../shared/types/lifeos.types';

export const getAnalyticsOverview = async (dateRange: string = 'last_30_days'): Promise<AnalyticsOverviewData> => {
  const res: any = await api.get(`/analytics/overview?dateRange=${dateRange}`);
  return res.data;
};

export const getProductivityAnalytics = async (dateRange: string = 'last_30_days'): Promise<any> => {
  const res: any = await api.get(`/analytics/productivity?dateRange=${dateRange}`);
  return res.data;
};

export const getTaskAnalytics = async (dateRange: string = 'last_30_days'): Promise<any> => {
  const res: any = await api.get(`/analytics/tasks?dateRange=${dateRange}`);
  return res.data;
};

export const getWorkloadAnalytics = async (dateRange: string = 'last_30_days'): Promise<any> => {
  const res: any = await api.get(`/analytics/workload?dateRange=${dateRange}`);
  return res.data;
};

export const getGoalAnalytics = async (dateRange: string = 'last_30_days'): Promise<any> => {
  const res: any = await api.get(`/analytics/goals?dateRange=${dateRange}`);
  return res.data;
};

export const getBehavioralPatterns = async (dateRange: string = 'last_30_days'): Promise<any> => {
  const res: any = await api.get(`/analytics/patterns?dateRange=${dateRange}`);
  return res.data;
};
