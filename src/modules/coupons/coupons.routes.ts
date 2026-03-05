import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// ADMIN ROUTES
// POST /api/coupons - Create
router.post('/', authenticate, CouponsController.create);

// GET /api/coupons - List (paginated/filtered)
router.get('/', authenticate, CouponsController.list);

// GET /api/coupons/summary - Summary analytics
router.get('/summary', authenticate, CouponsController.getSummary);

// GET /api/coupons/:id - Get detail
router.get('/:id', authenticate, CouponsController.get);

// PATCH /api/coupons/:id - Update
router.patch('/:id', authenticate, CouponsController.update);

// DELETE /api/coupons/:id - Soft Delete / Deactivate
router.delete('/:id', authenticate, CouponsController.delete);

// PATCH /api/coupons/:id/toggle - Toggle Status
router.patch('/:id/toggle', authenticate, CouponsController.toggleStatus);

// GET /api/coupons/:id/redemptions - Redemption history
router.get('/:id/redemptions', authenticate, CouponsController.getRedemptions);


// PUBLIC ROUTE (CHECKOUT)
// POST /api/coupons/validate - Validate coupon for checkout
router.post('/validate', CouponsController.validate);

export default router;
