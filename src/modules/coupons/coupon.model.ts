import { Schema, model, Document } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed_amount',
}

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountAmount: number;
  minSpend?: number;
  maxDiscount?: number;
  startDate?: Date;
  expiryDate?: Date;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  isActive: boolean;
  applicablePlans?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      default: DiscountType.PERCENTAGE,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    minSpend: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicablePlans: [{
      type: String,
    }],
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add text search for coupons
couponSchema.index({ code: 'text', name: 'text' });

export default model<ICoupon>('Coupon', couponSchema);
