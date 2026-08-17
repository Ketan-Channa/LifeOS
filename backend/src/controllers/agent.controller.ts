import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AgentService } from '../services/agent.service';

export class AgentController {
  static async run(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const result = await AgentService.runObjective(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRuns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const runs = await AgentService.getRuns(userId);
      res.json({ success: true, data: runs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRunById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const run = await AgentService.getRunById(userId, id);
      res.json({ success: true, data: run });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async cancelRun(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await AgentService.cancelRun(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const settings = await AgentService.getSettings(userId);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const settings = await AgentService.updateSettings(userId, req.body);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getMemories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const memories = await AgentService.getMemories(userId);
      res.json({ success: true, data: memories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const memory = await AgentService.createMemory(userId, req.body);
      res.status(201).json({ success: true, data: memory });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await AgentService.deleteMemory(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async undoAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await AgentService.undoAction(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
