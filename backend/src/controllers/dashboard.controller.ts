import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const overview = await DashboardService.getOverview(userId);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
