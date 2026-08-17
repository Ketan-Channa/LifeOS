import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, postponeTaskSchema } from '../../../shared/validation/lifeos.schema';

export class TaskController {
  static async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const tasks = await TaskService.getTasks(userId, req.query);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await TaskService.getTaskStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const task = await TaskService.getTaskById(userId, taskId);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const validatedData = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(userId, validatedData);
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(userId, taskId, validatedData);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async startTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const task = await TaskService.startTask(userId, taskId);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async pauseTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const { elapsedMinutes } = req.body;
      const task = await TaskService.pauseTask(userId, taskId, elapsedMinutes);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async resumeTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const task = await TaskService.resumeTask(userId, taskId);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async toggleComplete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const task = await TaskService.toggleCompleteTask(userId, taskId);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const { finalActualMinutes } = req.body;
      const task = await TaskService.completeTask(userId, taskId, finalActualMinutes);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async postponeTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const validated = postponeTaskSchema.parse(req.body);
      const task = await TaskService.postponeTask(userId, taskId, validated.newDueDate);
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async getTaskHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      const history = await TaskService.getTaskHistory(userId, taskId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id as string;
      await TaskService.deleteTask(userId, taskId);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
