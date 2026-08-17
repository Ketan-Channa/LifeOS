import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateJwt } from '../middleware/auth.middleware';
import { KnowledgeController } from '../controllers/knowledge.controller';

const uploadDir = path.resolve(__dirname, '../../../storage/temp_uploads');
const upload = multer({ dest: uploadDir });

const router = Router();

router.use(authenticateJwt as any);

router.post('/upload', upload.single('file'), KnowledgeController.upload as any);
router.get('/documents', KnowledgeController.getDocuments as any);
router.get('/documents/:id', KnowledgeController.getDocumentById as any);
router.patch('/documents/:id', KnowledgeController.updateDocument as any);
router.delete('/documents/:id', KnowledgeController.deleteDocument as any);
router.post('/documents/:id/reprocess', KnowledgeController.reprocessDocument as any);
router.get('/stats', KnowledgeController.getStats as any);
router.get('/search', KnowledgeController.search as any);
router.post('/query', KnowledgeController.query as any);
router.post('/compare', KnowledgeController.compare as any);

export default router;
