import { Router } from 'express';
import { AIPlanController } from '../controllers/ai_plan.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/generate', AIPlanController.generatePlans);
router.post('/apply', AIPlanController.applyPlan);
router.get('/history', AIPlanController.getHistory);
router.post('/pdf', AIPlanController.exportPDF);

export default router;
