import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

export class AIController {
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { message, conversationHistory } = req.body;
      if (!message || !message.trim()) {
        res.status(400).json({ success: false, message: 'Message is required' });
        return;
      }

      const result = await AIService.chat(userId, message, conversationHistory || []);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await AIService.getRecommendations(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDailyPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateStr = req.query.date as string | undefined;
      const data = await AIService.getDailyPlan(userId, dateStr);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async explain(req: Request, res: Response): Promise<void> {
    try {
      const { metricType, metricValue } = req.body;
      const data = await AIService.explain(metricType, metricValue);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHealth(req: Request, res: Response): Promise<void> {
    res.json({ success: true, status: 'healthy', service: 'LifeOS AI Proxy Engine' });
  }
}
