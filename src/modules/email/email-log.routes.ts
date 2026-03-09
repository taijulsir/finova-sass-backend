import { Router } from 'express';
import { getEmailLogs, getEmailLogDetails } from './email-log.controller';
import { requirePlatformAdmin } from '../../middlewares/rbac.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requirePlatformAdmin());

router.get('/', getEmailLogs);
router.get('/:id', getEmailLogDetails);

export default router;
