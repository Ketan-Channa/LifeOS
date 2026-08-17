import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getOverview(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProductivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getProductivity(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getTaskAnalysis(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWorkloadAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getWorkloadAnalysis(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGoalAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getGoalAnalysis(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPatterns(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateRange = (req.query.dateRange as string) || 'last_30_days';
      const data = await AnalyticsService.getPatterns(userId, dateRange);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
