import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service';

export class CouponController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CouponService.list(req.query);
      res.json({ success: true, data: result.docs, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await CouponService.update(id, {}); // just fetching
      if (!item) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: (req as any).user?._id || 'admin', // use req.user from auth middleware
      };
      const coupon = await CouponService.create(data);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await CouponService.update(id, req.body);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await CouponService.delete(id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, message: 'Coupon deactivated successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const coupon = await CouponService.update(id, { isActive: active });
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async getRedemptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const redemptions = await CouponService.redemptions(id);
      res.json({ success: true, data: redemptions });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await CouponService.summary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, planId, amount } = req.body;
      const result = await CouponService.validateCoupon(code, planId, amount);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
