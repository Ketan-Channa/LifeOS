import { Request, Response } from 'express';
import { NoteService } from '../services/note.service';
import { createNoteSchema, updateNoteSchema } from '../../../shared/validation/lifeos.schema';

export class NoteController {
  static async getNotes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const notes = await NoteService.getNotes(userId);
      res.json({ success: true, data: notes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getNoteById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const noteId = req.params.id as string;
      const note = await NoteService.getNoteById(userId, noteId);
      res.json({ success: true, data: note });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const validatedData = createNoteSchema.parse(req.body);
      const note = await NoteService.createNote(userId, validatedData);
      res.status(201).json({ success: true, data: note });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const noteId = req.params.id as string;
      const validatedData = updateNoteSchema.parse(req.body);
      const note = await NoteService.updateNote(userId, noteId, validatedData);
      res.json({ success: true, data: note });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const noteId = req.params.id as string;
      await NoteService.deleteNote(userId, noteId);
      res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
