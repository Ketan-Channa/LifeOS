import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/overview', DashboardController.getOverview);

export default router;
