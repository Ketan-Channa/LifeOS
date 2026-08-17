import { api } from './api';
import { DashboardOverview } from '../../../shared/types/lifeos.types';

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const res: any = await api.get('/dashboard/overview');
  return res.data;
};
