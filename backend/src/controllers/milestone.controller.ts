import { Request, Response } from 'express';
import { MilestoneService } from '../services/milestone.service';
import { createMilestoneSchema, updateMilestoneSchema } from '../../../shared/validation/lifeos.schema';

export class MilestoneController {
  static async getMilestones(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.goalId as string;
      const milestones = await MilestoneService.getMilestones(userId, goalId);
      res.json({ success: true, data: milestones });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.goalId as string;
      const validatedData = createMilestoneSchema.parse(req.body);
      const milestone = await MilestoneService.createMilestone(userId, goalId, validatedData);
      res.status(201).json({ success: true, data: milestone });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const milestoneId = req.params.id as string;
      const validatedData = updateMilestoneSchema.parse(req.body);
      const milestone = await MilestoneService.updateMilestone(userId, milestoneId, validatedData);
      res.json({ success: true, data: milestone });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async completeMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const milestoneId = req.params.id as string;
      const milestone = await MilestoneService.completeMilestone(userId, milestoneId);
      res.json({ success: true, data: milestone });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async reopenMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const milestoneId = req.params.id as string;
      const milestone = await MilestoneService.reopenMilestone(userId, milestoneId);
      res.json({ success: true, data: milestone });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async reorderMilestones(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.goalId as string;
      const { orders } = req.body;
      const milestones = await MilestoneService.reorderMilestones(userId, goalId, orders);
      res.json({ success: true, data: milestones });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteMilestone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const milestoneId = req.params.id as string;
      await MilestoneService.deleteMilestone(userId, milestoneId);
      res.json({ success: true, message: 'Milestone deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
