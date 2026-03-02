import { Router } from 'express';
import { FeatureFlagsController } from './feature-flags.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/feature-flags
router.get('/', authenticate, FeatureFlagsController.list);
router.get('/:id', authenticate, FeatureFlagsController.get);

export default router;
