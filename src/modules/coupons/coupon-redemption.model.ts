import { Schema, model, Document, Types } from 'mongoose';

export interface ICouponRedemption extends Document {
  couponId: Types.ObjectId;
  userId: string;
  orderId?: string;
  planId?: string;
  amount: number;
  discount: number;
  redeemedAt: Date;
}

const redemptionSchema = new Schema<ICouponRedemption>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    userId: {
      type: String, // Or ObjectId if linked to user model
      required: true,
    },
    orderId: String,
    planId: String,
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default model<ICouponRedemption>('CouponRedemption', redemptionSchema);
