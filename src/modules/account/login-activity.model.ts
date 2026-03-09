import mongoose, { Schema, Document } from 'mongoose';

export type LoginStatus = 'success' | 'failed';

export interface ILoginActivity extends Document {
  userId: mongoose.Types.ObjectId;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  status: LoginStatus;
  loginTime: Date;
  userAgent: string;
}

const loginActivitySchema = new Schema<ILoginActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ipAddress: { type: String, default: '' },
    device: { type: String, default: 'Unknown Device' },
    browser: { type: String, default: 'Unknown Browser' },
    location: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    loginTime: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

loginActivitySchema.index({ userId: 1, loginTime: -1 });

export const LoginActivity = mongoose.model<ILoginActivity>('LoginActivity', loginActivitySchema);
