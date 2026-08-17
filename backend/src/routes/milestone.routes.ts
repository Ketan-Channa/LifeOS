import { Router } from 'express';
import { MilestoneController } from '../controllers/milestone.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.patch('/:id', MilestoneController.updateMilestone);
router.delete('/:id', MilestoneController.deleteMilestone);
router.patch('/:id/complete', MilestoneController.completeMilestone);
router.patch('/:id/reopen', MilestoneController.reopenMilestone);

export default router;
