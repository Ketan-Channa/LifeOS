import { api } from './api';
import {
  KnowledgeDocumentItem, KnowledgeStats, GroundedAnswerResponse,
  DocumentComparisonResponse
} from '../../../shared/types/lifeos.types';

export const getKnowledgeDocuments = async (filters: any = {}): Promise<KnowledgeDocumentItem[]> => {
  const res: any = await api.get('/knowledge/documents', { params: filters });
  return res.data;
};

export const getKnowledgeDocumentById = async (id: string): Promise<KnowledgeDocumentItem> => {
  const res: any = await api.get(`/knowledge/documents/${id}`);
  return res.data;
};

export const uploadKnowledgeDocument = async (formData: FormData): Promise<KnowledgeDocumentItem> => {
  const res: any = await api.post('/knowledge/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateKnowledgeDocument = async (id: string, data: any): Promise<KnowledgeDocumentItem> => {
  const res: any = await api.patch(`/knowledge/documents/${id}`, data);
  return res.data;
};

export const deleteKnowledgeDocument = async (id: string): Promise<any> => {
  const res: any = await api.delete(`/knowledge/documents/${id}`);
  return res;
};

export const reprocessKnowledgeDocument = async (id: string): Promise<any> => {
  const res: any = await api.post(`/knowledge/documents/${id}/reprocess`);
  return res;
};

export const getKnowledgeStats = async (): Promise<KnowledgeStats> => {
  const res: any = await api.get('/knowledge/stats');
  return res.data;
};

export const searchKnowledge = async (queryText: string, category?: string): Promise<any> => {
  const res: any = await api.get('/knowledge/search', { params: { queryText, category } });
  return res;
};

export const queryKnowledge = async (question: string, category?: string, documentIds?: string[]): Promise<GroundedAnswerResponse> => {
  const res: any = await api.post('/knowledge/query', { question, category, documentIds });
  return res.data;
};

export const compareKnowledgeDocuments = async (documentAId: string, documentBId: string): Promise<DocumentComparisonResponse> => {
  const res: any = await api.post('/knowledge/compare', { documentAId, documentBId });
  return res.data;
};
