import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/checkout', authenticateJwt, PaymentController.checkout);
router.get('/my-plan', authenticateJwt, PaymentController.getMyPlan);

export default router;
