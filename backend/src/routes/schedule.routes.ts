import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', ScheduleController.getEvents);
router.get('/day', ScheduleController.getDayEvents);
router.get('/week', ScheduleController.getWeekEvents);
router.get('/month', ScheduleController.getMonthEvents);
router.get('/stats', ScheduleController.getScheduleStats);
router.get('/conflicts', ScheduleController.getConflicts);
router.get('/free-time', ScheduleController.getFreeTime);
router.get('/adherence', ScheduleController.getScheduleAdherence);

router.post('/', ScheduleController.createEvent);
router.patch('/:id', ScheduleController.updateEvent);
router.delete('/:id', ScheduleController.deleteEvent);

export default router;
