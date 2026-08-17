import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/security-question/:email', AuthController.getSecurityQuestion);
router.post('/reset-password-security', AuthController.resetWithSecurityQuestion);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', authenticateJwt, AuthController.me);
router.get('/export-data', authenticateJwt, AuthController.exportData as any);
router.delete('/account', authenticateJwt, AuthController.deleteAccount as any);

export default router;
