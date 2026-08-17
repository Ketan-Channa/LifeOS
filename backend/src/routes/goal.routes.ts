import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { MilestoneController } from '../controllers/milestone.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

// Goal Stats Route
router.get('/stats', GoalController.getGoalStats);

// Goal List & Create Routes
router.get('/', GoalController.getGoals);
router.post('/', GoalController.createGoal);

// Milestone routes scoped to goal
router.get('/:goalId/milestones', MilestoneController.getMilestones);
router.post('/:goalId/milestones', MilestoneController.createMilestone);
router.patch('/:goalId/milestones/reorder', MilestoneController.reorderMilestones);

// Single Goal Actions
router.get('/:id', GoalController.getGoalById);
router.patch('/:id', GoalController.updateGoal);
router.delete('/:id', GoalController.deleteGoal);
router.patch('/:id/progress', GoalController.updateProgress);
router.patch('/:id/complete', GoalController.completeGoal);
router.patch('/:id/pause', GoalController.pauseGoal);
router.patch('/:id/archive', GoalController.archiveGoal);
router.get('/:id/history', GoalController.getGoalHistory);

export default router;
