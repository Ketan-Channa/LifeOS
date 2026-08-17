import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { KnowledgeService } from '../services/knowledge.service';

export class KnowledgeController {
  static async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;
      
      const file = (req as any).file;
      const document = await KnowledgeService.uploadDocument(userId, file, req.body);
      res.status(201).json({ success: true, data: document });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const documents = await KnowledgeService.getDocuments(userId, req.query);
      res.json({ success: true, data: documents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDocumentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const document = await KnowledgeService.getDocumentById(userId, id);
      res.json({ success: true, data: document });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const document = await KnowledgeService.updateDocument(userId, id, req.body);
      res.json({ success: true, data: document });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await KnowledgeService.deleteDocument(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async reprocessDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const id = req.params.id as string;
      const result = await KnowledgeService.reprocessDocument(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const stats = await KnowledgeService.getStats(userId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const results = await KnowledgeService.search(userId, req.query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async query(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const answer = await KnowledgeService.query(userId, req.body);
      res.json({ success: true, data: answer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async compare(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' }) as any;

      const comparison = await KnowledgeService.compare(userId, req.body);
      res.json({ success: true, data: comparison });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
