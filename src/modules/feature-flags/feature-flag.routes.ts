import { Router } from 'express';
import { FeatureFlagController } from './feature-flag.controller';
import { authenticate, requireSuperAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Admin Routes (all require authentication and specialized access)
router.get('/', authenticate,  FeatureFlagController.list);
router.post('/', authenticate, requireSuperAdmin, FeatureFlagController.create);
router.get('/:id', authenticate, FeatureFlagController.get);
router.patch('/:id', authenticate, requireSuperAdmin, FeatureFlagController.update);
router.delete('/:id', authenticate, requireSuperAdmin, FeatureFlagController.delete);

router.patch('/:id/global', authenticate, requireSuperAdmin, FeatureFlagController.toggleGlobal);
router.patch('/:id/organization', authenticate, requireSuperAdmin, FeatureFlagController.toggleOrganization);

// Organization Route
router.get('/organization/active', authenticate, FeatureFlagController.getOrganizationFeatures);

export default router;
