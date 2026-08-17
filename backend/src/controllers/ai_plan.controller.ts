import { Request, Response } from 'express';
import { AIPlanService } from '../services/ai_plan.service';

export class AIPlanController {
  static async generatePlans(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await AIPlanService.generatePlans(userId, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async applyPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const result = await AIPlanService.applyPlan(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const history = await AIPlanService.getHistory(userId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async exportPDF(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const pdfBuffer = await AIPlanService.exportPDF(userId, req.body);
      const filename = `LifeOS_AI_Plan_${req.body.date || 'today'}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
