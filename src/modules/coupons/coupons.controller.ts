import { Request, Response, NextFunction } from 'express';
import { CouponsService } from './coupons.service';

export class CouponsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await CouponsService.list();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await CouponsService.get(id);
      if (!item) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
}
