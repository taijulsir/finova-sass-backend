import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/coupons - list coupons (requires auth)
router.get('/', authenticate, CouponsController.list);

// GET /api/coupons/:id - get coupon by id (requires auth)
router.get('/:id', authenticate, CouponsController.get);

export default router;
