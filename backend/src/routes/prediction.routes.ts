import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/overview', PredictionController.getOverview);
router.get('/tasks', PredictionController.getTaskRisk);
router.get('/tasks/:id', PredictionController.getTaskRisk);
router.get('/goals', PredictionController.getGoalRisk);
router.get('/goals/:id', PredictionController.getGoalRisk);
router.get('/productivity', PredictionController.getProductivityForecast);
router.get('/workload', PredictionController.getWorkloadPrediction);

export default router;
