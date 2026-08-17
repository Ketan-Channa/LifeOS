import { api } from './api';
import { NoteItem } from '../../../shared/types/lifeos.types';

export const getNotes = async (): Promise<NoteItem[]> => {
  const res: any = await api.get('/notes');
  return res.data;
};

export const createNote = async (data: Partial<NoteItem>): Promise<NoteItem> => {
  const res: any = await api.post('/notes', data);
  return res.data;
};

export const updateNote = async (id: string, data: Partial<NoteItem>): Promise<NoteItem> => {
  const res: any = await api.patch(`/notes/${id}`, data);
  return res.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await api.delete(`/notes/${id}`);
};
