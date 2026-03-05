import { Request, Response, NextFunction } from 'express';
import { CouponsService, CreateCouponDTO, CouponFilter } from './coupons.service';

export class CouponsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        type: req.query.type as any,
        active: req.query.active === undefined ? undefined : req.query.active === 'true',
        expired: req.query.expired === undefined ? undefined : req.query.expired === 'true',
        minUsage: parseInt(req.query.minUsage as string) || undefined,
        maxUsage: parseInt(req.query.maxUsage as string) || undefined,
      };

      const result = await CouponsService.getCoupons(filters);
      res.json({ success: true, data: result.docs, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await CouponsService.updateCoupon(id, {}); // just fetching
      if (!item) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateCouponDTO = {
        ...req.body,
        createdBy: req.user?._id || 'admin', // use req.user from auth middleware
      };
      const coupon = await CouponsService.createCoupon(data);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await CouponsService.updateCoupon(id, req.body);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await CouponsService.deleteCoupon(id);
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
      const coupon = await CouponsService.updateCoupon(id, { isActive: active });
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  static async getRedemptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const redemptions = await CouponsService.getRedemptions(id);
      res.json({ success: true, data: redemptions });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await CouponsService.getCouponSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, planId, amount } = req.body;
      const result = await CouponsService.applyCoupon(code, planId, amount);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
