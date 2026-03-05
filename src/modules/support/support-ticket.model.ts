import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketId: string;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedAdmin?: Types.ObjectId;
  attachments: string[];
  lastReplyAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    attachments: [{ type: String }],
    lastReplyAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SupportTicketSchema.index({ organizationId: 1, status: 1 });
SupportTicketSchema.index({ ticketId: 1 });
SupportTicketSchema.index({ assignedAdmin: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
