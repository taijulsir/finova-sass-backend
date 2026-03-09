import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  device: string;
  browser: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  lastActiveAt: Date;
  isCurrent: boolean;
  createdAt: Date;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    device: { type: String, default: 'Unknown Device' },
    browser: { type: String, default: 'Unknown Browser' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    location: { type: String, default: '' },
    lastActiveAt: { type: Date, default: Date.now },
    isCurrent: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSessionSchema.index({ userId: 1, createdAt: -1 });

export const UserSession = mongoose.model<IUserSession>('UserSession', userSessionSchema);
