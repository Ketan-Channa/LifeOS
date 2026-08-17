import { Request, Response } from 'express';
import { PredictionService } from '../services/prediction.service';

export class PredictionController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await PredictionService.getPredictionsOverview(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskRisk(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const data = await PredictionService.getTaskRisk(userId, taskId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGoalRisk(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const data = await PredictionService.getGoalRisk(userId, goalId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProductivityForecast(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await PredictionService.getProductivityForecast(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWorkloadPrediction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await PredictionService.getWorkloadPrediction(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
