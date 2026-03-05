import { Coupon, ICouponDocument } from './coupons.model';
import { CouponRedemption } from './coupon-redemption.model';
import mongoose from 'mongoose';

export interface CreateCouponDTO {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUsage: number;
  appliesToPlans: string[];
  minPurchaseAmount: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdBy: string;
}

export interface CouponFilter {
  search?: string;
  type?: 'percentage' | 'fixed';
  active?: boolean;
  expired?: boolean;
  minUsage?: number;
  maxUsage?: number;
  page: number;
  limit: number;
}

export const CouponsService = {
  async createCoupon(data: CreateCouponDTO): Promise<ICouponDocument> {
    const coupon = new Coupon({
      ...data,
      appliesToPlans: data.appliesToPlans.map(id => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    });
    return await coupon.save();
  },

  async updateCoupon(id: string, data: Partial<CreateCouponDTO>): Promise<ICouponDocument | null> {
    return await Coupon.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteCoupon(id: string): Promise<ICouponDocument | null> {
    return await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });
  },

  async getCoupons(filter: CouponFilter) {
    const query: any = {};

    if (filter.search) {
      query.code = { $regex: filter.search, $options: 'i' };
    }
    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.active !== undefined) {
      query.isActive = filter.active;
    }
    if (filter.expired === true) {
      query.expiresAt = { $lt: new Date() };
    } else if (filter.expired === false) {
      query.expiresAt = { $gte: new Date() };
    }

    const skip = (filter.page - 1) * filter.limit;
    const [docs, total] = await Promise.all([
      Coupon.find(query).skip(skip).limit(filter.limit).sort({ createdAt: -1 }),
      Coupon.countDocuments(query),
    ]);

    return { docs, total, page: filter.page, totalPages: Math.ceil(total / filter.limit) };
  },

  async getCouponByCode(code: string): Promise<ICouponDocument | null> {
    return await Coupon.findOne({ code, isActive: true });
  },

  async applyCoupon(code: string, planId: string, amount: number) {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) throw new Error('Invalid coupon code');

    const now = new Date();
    if (!coupon.isActive) throw new Error('Coupon is disabled');
    if (coupon.usedCount >= coupon.maxUsage && coupon.maxUsage > 0) throw new Error('Coupon usage limit reached');
    if (coupon.startsAt > now) throw new Error('Coupon is not yet active');
    if (coupon.expiresAt < now) throw new Error('Coupon expired');
    if (coupon.minPurchaseAmount > amount) throw new Error(`Minimum purchase of ${coupon.minPurchaseAmount} required`);
    
    if (coupon.appliesToPlans.length > 0 && !coupon.appliesToPlans.some(id => id.toString() === planId)) {
      throw new Error('Coupon does not apply to this plan');
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (amount * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    return {
      couponId: coupon._id,
      discountAmount: Math.min(discountAmount, amount),
      finalPrice: Math.max(0, amount - discountAmount),
    };
  },

  async redeemCoupon(couponId: string, organizationId: string, userId: string, discountAmount: number) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const coupon = await Coupon.findById(couponId).session(session);
      if (!coupon) throw new Error('Coupon not found');
      
      coupon.usedCount += 1;
      await coupon.save({ session });

      const redemption = new CouponRedemption({
        couponId: new mongoose.Types.ObjectId(couponId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        userId: new mongoose.Types.ObjectId(userId),
        discountAmount,
      });
      await redemption.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getRedemptions(couponId: string) {
    return await CouponRedemption.find({ couponId: new mongoose.Types.ObjectId(couponId) })
      .populate('organizationId', 'name')
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 });
  },

  async getCouponSummary() {
    const [total, active, expired, redemptions] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true, expiresAt: { $gte: new Date() } }),
      Coupon.countDocuments({ expiresAt: { $lt: new Date() } }),
      CouponRedemption.aggregate([
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            totalDiscountImpact: { $sum: '$discountAmount' },
          },
        },
      ]),
    ]);

    const topPerforming = await Coupon.findOne().sort({ usedCount: -1 }).limit(1);

    return {
      total,
      active,
      expired,
      totalUsage: redemptions[0]?.totalUsage || 0,
      totalDiscountImpact: redemptions[0]?.totalDiscountImpact || 0,
      topPerforming: topPerforming?.code || 'N/A',
    };
  }
};
