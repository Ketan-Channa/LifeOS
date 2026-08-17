import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { createScheduleEventSchema, updateScheduleEventSchema } from '../../../shared/validation/lifeos.schema';

export class ScheduleController {
  static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateStr = req.query.date as string | undefined;
      const events = await ScheduleService.getEvents(userId, dateStr);
      res.json({ success: true, data: events });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDayEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const data = await ScheduleService.getDayEvents(userId, dateStr);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getWeekEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const startDateStr = (req.query.startDate as string) || new Date().toISOString().split('T')[0];
      const data = await ScheduleService.getWeekEvents(userId, startDateStr);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getMonthEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const now = new Date();
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();
      const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
      const data = await ScheduleService.getMonthEvents(userId, year, month);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const validatedData = createScheduleEventSchema.parse(req.body);
      const event = await ScheduleService.createEvent(userId, validatedData);
      res.status(201).json({ success: true, data: event });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || error.errors });
    }
  }

  static async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const eventId = req.params.id as string;
      const validatedData = updateScheduleEventSchema.parse(req.body);
      const event = await ScheduleService.updateEvent(userId, eventId, validatedData);
      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const eventId = req.params.id as string;
      await ScheduleService.deleteEvent(userId, eventId);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getConflicts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const conflicts = await ScheduleService.detectConflicts(userId, dateStr);
      res.json({ success: true, data: conflicts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getFreeTime(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const freeTime = await ScheduleService.detectFreeTime(userId, dateStr);
      res.json({ success: true, data: freeTime });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getScheduleAdherence(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const adherence = await ScheduleService.getScheduleAdherence(userId);
      res.json({ success: true, data: adherence });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getScheduleStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await ScheduleService.getScheduleStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
