import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { ScoutController } from '../controllers/scout.controller';

const router = Router();

router.use(authenticateJwt as any);

router.post('/chat', ScoutController.chat as any);
router.get('/conversations', ScoutController.getConversations as any);
router.get('/conversations/:id', ScoutController.getConversationById as any);
router.post('/conversations', ScoutController.createConversation as any);
router.delete('/conversations/:id', ScoutController.deleteConversation as any);
router.post('/actions/:id/confirm', ScoutController.confirmAction as any);
router.post('/actions/:id/cancel', ScoutController.cancelAction as any);
router.get('/briefing', ScoutController.getBriefing as any);
router.get('/weekly-review', ScoutController.getWeeklyReview as any);

export default router;
