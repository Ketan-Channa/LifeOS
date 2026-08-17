import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { AgentController } from '../controllers/agent.controller';

const router = Router();

router.use(authenticateJwt as any);

router.post('/run', AgentController.run as any);
router.get('/runs', AgentController.getRuns as any);
router.get('/runs/:id', AgentController.getRunById as any);
router.post('/runs/:id/cancel', AgentController.cancelRun as any);

router.get('/settings', AgentController.getSettings as any);
router.post('/settings', AgentController.updateSettings as any);

router.get('/memories', AgentController.getMemories as any);
router.post('/memories', AgentController.createMemory as any);
router.delete('/memories/:id', AgentController.deleteMemory as any);

router.post('/actions/:id/undo', AgentController.undoAction as any);

export default router;
