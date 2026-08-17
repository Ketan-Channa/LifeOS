import { Request, Response } from 'express';
import { HabitService } from '../services/habit.service';
import { createHabitSchema, updateHabitSchema, logHabitSchema } from '../../../shared/validation/lifeos.schema';

export class HabitController {
  static async getHabits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const filterParams = {
        category: req.query.category as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string
      };
      const habits = await HabitService.getHabits(userId, filterParams);
      res.json({ success: true, data: habits });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHabitById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const habit = await HabitService.getHabitById(userId, habitId);
      res.json({ success: true, data: habit });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const validatedData = createHabitSchema.parse(req.body);
      const habit = await HabitService.createHabit(userId, validatedData);
      res.status(201).json({ success: true, data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const validatedData = updateHabitSchema.parse(req.body);
      const habit = await HabitService.updateHabit(userId, habitId, validatedData);
      res.json({ success: true, data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async pauseHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const habit = await HabitService.pauseHabit(userId, habitId);
      res.json({ success: true, data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async resumeHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const habit = await HabitService.resumeHabit(userId, habitId);
      res.json({ success: true, data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async archiveHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const habit = await HabitService.archiveHabit(userId, habitId);
      res.json({ success: true, data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      await HabitService.deleteHabit(userId, habitId);
      res.json({ success: true, message: 'Habit deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async logHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habitId = req.params.id as string;
      const validatedData = logHabitSchema.parse(req.body);
      const log = await HabitService.logHabit(userId, habitId, validatedData);
      res.json({ success: true, data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async getTodayHabits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habits = await HabitService.getTodayHabits(userId);
      res.json({ success: true, data: habits });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWeeklyHabits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await HabitService.getWeeklyHabits(userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getMonthlyHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const heatmap = await HabitService.getMonthlyHeatmap(userId);
      res.json({ success: true, data: heatmap });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHabitStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await HabitService.getHabitStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
