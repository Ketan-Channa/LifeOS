import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

// Specific routes before param routes
router.get('/stats', TaskController.getTaskStats);
router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);

// Task ID specific routes
router.get('/:id', TaskController.getTaskById);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

// Task Timer & Status Action Routes
router.patch('/:id/start', TaskController.startTask);
router.patch('/:id/pause', TaskController.pauseTask);
router.patch('/:id/resume', TaskController.resumeTask);
router.patch('/:id/complete', TaskController.completeTask);
router.patch('/:id/postpone', TaskController.postponeTask);
router.get('/:id/history', TaskController.getTaskHistory);

export default router;
