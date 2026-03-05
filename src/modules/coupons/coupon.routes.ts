import { Router } from 'express';
import { CouponController } from './coupon.controller';

const router = Router();

router.get('/', CouponController.list);
router.get('/summary', CouponController.getSummary);
router.get('/:id', CouponController.get);
router.get('/:id/redemptions', CouponController.getRedemptions);
router.post('/', CouponController.create);
router.put('/:id', CouponController.update);
router.delete('/:id', CouponController.delete);
router.patch('/:id/toggle-status', CouponController.toggleStatus);
router.post('/validate', CouponController.validate);

export default router;
