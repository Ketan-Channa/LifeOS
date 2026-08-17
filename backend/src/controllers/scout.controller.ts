import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ScoutService } from '../services/scout.service';
import { ActionService } from '../services/action.service';

export class ScoutController {
  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const result = await ScoutService.sendChatMessage(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const conversations = await ScoutService.getConversations(userId);
      res.json({ success: true, data: conversations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const conversation = await ScoutService.getConversationById(userId, id);
      res.json({ success: true, data: conversation });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const conversation = await ScoutService.createConversation(userId, req.body.title);
      res.status(201).json({ success: true, data: conversation });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await ScoutService.deleteConversation(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async confirmAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await ActionService.confirmAction(userId, id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async cancelAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await ActionService.cancelAction(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getBriefing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const briefing = await ScoutService.getBriefing(userId);
      res.json(briefing);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWeeklyReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const review = await ScoutService.getWeeklyReview(userId);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
