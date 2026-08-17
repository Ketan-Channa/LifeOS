import { Request, Response } from 'express';
import { GoalService } from '../services/goal.service';
import { createGoalSchema, updateGoalSchema } from '../../../shared/validation/lifeos.schema';

export class GoalController {
  static async getGoals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goals = await GoalService.getGoals(userId, req.query);
      res.json({ success: true, data: goals });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGoalStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await GoalService.getGoalStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getGoalById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const goal = await GoalService.getGoalById(userId, goalId);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const validatedData = createGoalSchema.parse(req.body);
      const goal = await GoalService.createGoal(userId, validatedData);
      res.status(201).json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const validatedData = updateGoalSchema.parse(req.body);
      const goal = await GoalService.updateGoal(userId, goalId, validatedData);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const { progress } = req.body;
      const goal = await GoalService.updateProgress(userId, goalId, Number(progress));
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async completeGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const goal = await GoalService.completeGoal(userId, goalId);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async pauseGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const goal = await GoalService.pauseGoal(userId, goalId);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async archiveGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const goal = await GoalService.archiveGoal(userId, goalId);
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getGoalHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      const history = await GoalService.getGoalHistory(userId, goalId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goalId = req.params.id as string;
      await GoalService.deleteGoal(userId, goalId);
      res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
