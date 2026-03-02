import { Request, Response, NextFunction } from 'express';
import { FeatureFlagsService } from './feature-flags.service';

export class FeatureFlagsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await FeatureFlagsService.list();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await FeatureFlagsService.get(id);
      if (!item) return res.status(404).json({ success: false, message: 'Feature flag not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
}
