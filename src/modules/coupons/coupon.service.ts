import { Types } from 'mongoose';
import Coupon, { ICoupon, DiscountType } from './coupon.model';
import CouponRedemption from './coupon-redemption.model';

export class CouponService {
  static async list(query: any = {}) {
    const { page = 1, limit = 10, search = '', active, type } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (active !== undefined) filter.isActive = active === 'true';
    if (type) filter.discountType = type;

    const [docs, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Coupon.countDocuments(filter),
    ]);

    return {
      docs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  static async create(data: Partial<ICoupon>) {
    return await Coupon.create(data);
  }

  static async update(id: string, data: Partial<ICoupon>) {
    return await Coupon.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    // Soft delete / deactivate
    return await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  static async redemptions(couponId: string) {
    return await CouponRedemption.find({ couponId }).sort({ redeemedAt: -1 });
  }

  static async summary() {
    const [totalCoupons, activeCoupons, totalRedemptions] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true }),
      CouponRedemption.countDocuments(),
    ]);

    const totalDiscountGiven = await CouponRedemption.aggregate([
      { $group: { _id: null, total: { $sum: '$discount' } } },
    ]);

    return {
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      totalDiscountGiven: totalDiscountGiven[0]?.total || 0,
    };
  }

  static async validateCoupon(code: string, planId: string, amount: number) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      throw new Error('Invalid or inactive coupon code');
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new Error('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    // Check min spend
    if (coupon.minSpend && amount < coupon.minSpend) {
      throw new Error(`Minimum spend of ${coupon.minSpend} required`);
    }

    // Check applicable plans
    if (coupon.applicablePlans?.length && !coupon.applicablePlans.includes(planId)) {
      throw new Error('Coupon not applicable for this plan');
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = (amount * coupon.discountAmount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountAmount;
    }

    return {
      couponId: coupon._id,
      code: coupon.code,
      discount,
      finalAmount: Math.max(0, amount - discount),
    };
  }
}
