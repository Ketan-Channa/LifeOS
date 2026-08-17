import { Router } from 'express';
import { HabitController } from '../controllers/habit.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', HabitController.getHabits);
router.get('/stats', HabitController.getHabitStats);
router.get('/logs/today', HabitController.getTodayHabits);
router.get('/logs/week', HabitController.getWeeklyHabits);
router.get('/logs/month', HabitController.getMonthlyHeatmap);
router.get('/:id', HabitController.getHabitById);

router.post('/', HabitController.createHabit);
router.patch('/:id', HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);

router.patch('/:id/pause', HabitController.pauseHabit);
router.patch('/:id/resume', HabitController.resumeHabit);
router.patch('/:id/archive', HabitController.archiveHabit);
router.post('/:id/logs', HabitController.logHabit);

export default router;
