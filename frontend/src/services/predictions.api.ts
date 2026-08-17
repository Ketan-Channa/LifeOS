import { api } from './api';
import { 
  PredictionsOverview, 
  TaskRiskPrediction, 
  GoalRiskPrediction, 
  ProductivityForecast, 
  WorkloadPrediction 
} from '../../../shared/types/lifeos.types';

export const getPredictionsOverview = async (): Promise<PredictionsOverview> => {
  const res: any = await api.get('/predictions/overview');
  return res.data;
};

export const getTaskRisk = async (taskId?: string): Promise<TaskRiskPrediction> => {
  const endpoint = taskId ? `/predictions/tasks/${taskId}` : '/predictions/tasks';
  const res: any = await api.get(endpoint);
  return res.data;
};

export const getGoalRisk = async (goalId?: string): Promise<GoalRiskPrediction> => {
  const endpoint = goalId ? `/predictions/goals/${goalId}` : '/predictions/goals';
  const res: any = await api.get(endpoint);
  return res.data;
};

export const getProductivityForecast = async (): Promise<ProductivityForecast> => {
  const res: any = await api.get('/predictions/productivity');
  return res.data;
};

export const getWorkloadPrediction = async (): Promise<WorkloadPrediction> => {
  const res: any = await api.get('/predictions/workload');
  return res.data;
};
