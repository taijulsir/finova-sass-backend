import { Types } from 'mongoose';
import FeatureFlag, { IFeatureFlag } from './feature-flag.model';

export class FeatureFlagService {
  static async list(query: any = {}) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { key: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      FeatureFlag.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      FeatureFlag.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  static async create(data: Partial<IFeatureFlag>) {
    // Generate slug-like key from name if not provided
    if (!data.key && data.name) {
      let slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');
      
      // Basic collision handling
      const existing = await FeatureFlag.findOne({ key: slug });
      if (existing) {
        slug = `${slug}_${Date.now().toString().slice(-4)}`;
      }
      data.key = slug;
    }
    return await FeatureFlag.create(data);
  }

  static async update(id: string, data: Partial<IFeatureFlag>) {
    return await FeatureFlag.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    return await FeatureFlag.findByIdAndDelete(id);
  }

  static async toggleGlobal(id: string, enabledGlobal: boolean) {
    return await FeatureFlag.findByIdAndUpdate(id, { enabledGlobal }, { new: true });
  }

  static async toggleOrganization(id: string, organizationId: string, enabled: boolean) {
    const featureFlag = await FeatureFlag.findById(id);
    if (!featureFlag) throw new Error('Feature flag not found');

    const orgId = new Types.ObjectId(organizationId);
    
    if (enabled) {
      if (!featureFlag.enabledOrganizations.some(id => id.toString() === organizationId)) {
        featureFlag.enabledOrganizations.push(orgId);
      }
    } else {
      featureFlag.enabledOrganizations = featureFlag.enabledOrganizations.filter(
        (id) => id.toString() !== organizationId
      );
    }

    return await featureFlag.save();
  }

  static async getFlagsForOrganization(organizationId: string) {
    const flags = await FeatureFlag.find({
      $or: [
        { enabledGlobal: true },
        {
          perOrganizationEnabled: true,
          enabledOrganizations: new Types.ObjectId(organizationId),
        },
      ],
    });

    const activeFeatures: Record<string, boolean> = {};
    flags.forEach((flag) => {
      activeFeatures[flag.key] = true;
    });

    return activeFeatures;
  }
}
