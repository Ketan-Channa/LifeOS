import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/chat', AIController.chat);
router.get('/recommendations', AIController.getRecommendations);
router.get('/daily-plan', AIController.getDailyPlan);
router.post('/explain', AIController.explain);
router.get('/health', AIController.getHealth);

export default router;
