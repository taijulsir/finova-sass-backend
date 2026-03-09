import { Router } from 'express';
import { AccountController } from './account.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All account routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', AccountController.getProfile);
router.patch('/profile', AccountController.updateProfile);

// Password
router.post('/change-password', AccountController.changePassword);

// 2FA
router.post('/2fa/setup', AccountController.setup2FA);
router.post('/2fa/verify', AccountController.verify2FA);
router.post('/2fa/disable', AccountController.disable2FA);

// Sessions
router.get('/sessions', AccountController.getSessions);
router.delete('/sessions/revoke-all', AccountController.revokeAllSessions);
router.delete('/sessions/:sessionId', AccountController.revokeSession);

// Login History
router.get('/login-history', AccountController.getLoginHistory);

export default router;
