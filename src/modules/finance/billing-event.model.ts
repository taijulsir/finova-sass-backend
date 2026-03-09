import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBillingEvent extends Document {
  eventId: string;
  provider: 'stripe' | 'paypal' | 'manual' | 'system';
  eventType: string;
  organizationId?: Types.ObjectId;
  referenceId?: string;
  status: 'received' | 'processing' | 'processed' | 'failed';
  payload: any;
  processingResult?: any;
  errorMessage?: string;
  receivedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillingEventSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual', 'system'],
      required: true,
    },
    eventType: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    referenceId: { type: String },
    status: {
      type: String,
      enum: ['received', 'processing', 'processed', 'failed'],
      default: 'received',
    },
    payload: { type: Schema.Types.Mixed },
    processingResult: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    receivedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
BillingEventSchema.index({ eventId: 1 }, { unique: true });
BillingEventSchema.index({ provider: 1 });
BillingEventSchema.index({ eventType: 1 });
BillingEventSchema.index({ organizationId: 1 });
BillingEventSchema.index({ status: 1 });
BillingEventSchema.index({ receivedAt: -1 });
BillingEventSchema.index({ referenceId: 1 });

// Composite indexes for common admin filters
BillingEventSchema.index({ provider: 1, status: 1 });
BillingEventSchema.index({ organizationId: 1, receivedAt: -1 });

export default mongoose.model<IBillingEvent>('BillingEvent', BillingEventSchema);
