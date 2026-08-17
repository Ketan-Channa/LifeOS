import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/overview', AnalyticsController.getOverview);
router.get('/productivity', AnalyticsController.getProductivity);
router.get('/tasks', AnalyticsController.getTaskAnalysis);
router.get('/workload', AnalyticsController.getWorkloadAnalysis);
router.get('/goals', AnalyticsController.getGoalAnalysis);
router.get('/patterns', AnalyticsController.getPatterns);

export default router;
