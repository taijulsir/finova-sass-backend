import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from './feature-flag.service';

export class FeatureFlagController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeatureFlagService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const doc = await FeatureFlagService.update(id, {});
      if (!doc) return res.status(404).json({ success: false, message: 'Feature flag not found' });
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await FeatureFlagService.create(req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await FeatureFlagService.update(req.params.id, req.body);
      if (!doc) return res.status(404).json({ success: false, message: 'Feature flag not found' });
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await FeatureFlagService.delete(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Feature flag not found' });
      res.json({ success: true, message: 'Feature flag deleted' });
    } catch (err) {
      next(err);
    }
  }

  static async toggleGlobal(req: Request, res: Response, next: NextFunction) {
    try {
      const { enabledGlobal } = req.body;
      const doc = await FeatureFlagService.toggleGlobal(req.params.id, enabledGlobal);
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async toggleOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId, enabled } = req.body;
      const doc = await FeatureFlagService.toggleOrganization(req.params.id, organizationId, enabled);
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async getOrganizationFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as any).user;
      const features = await FeatureFlagService.getFlagsForOrganization(orgId);
      res.json({ success: true, data: features });
    } catch (err) {
      next(err);
    }
  }
}
