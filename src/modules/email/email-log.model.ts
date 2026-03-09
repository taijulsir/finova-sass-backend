import { Schema, model, Document, Types } from 'mongoose';

export interface IEmailLog extends Document {
  emailId: string;
  recipient: string;
  subject: string;
  type: 'invite' | 'password_reset' | 'billing_invoice' | 'subscription_notification' | 'verification' | 'system';
  provider: 'resend' | 'sendgrid' | 'smtp' | 'system';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
  organizationId?: Types.ObjectId;
  userId?: Types.ObjectId;
  errorMessage?: string;
  metadata?: Record<string, any>;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['invite', 'password_reset', 'billing_invoice', 'subscription_notification', 'verification', 'system'],
      required: true,
    },
    provider: {
      type: String,
      enum: ['resend', 'sendgrid', 'smtp', 'system'],
      default: 'resend',
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'bounced'],
      default: 'queued',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
EmailLogSchema.index({ recipient: 1 });
EmailLogSchema.index({ type: 1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ provider: 1 });
EmailLogSchema.index({ organizationId: 1 });
EmailLogSchema.index({ createdAt: -1 });

export const EmailLog = model<IEmailLog>('EmailLog', EmailLogSchema);
