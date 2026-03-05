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
  tags: string[];
  slaDeadline: Date;
  history: {
    action: string;
    performedBy: Types.ObjectId;
    createdAt: Date;
  }[];
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
    tags: {
      type: [String],
      default: [],
    },
    slaDeadline: {
      type: Date,
    },
    history: [
      {
        action: {
          type: String,
        },
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// New enterprise indexes
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ tags: 1 });
SupportTicketSchema.index({ slaDeadline: 1 });
SupportTicketSchema.index({ status: 1, priority: 1 });

// Middleware to calculate SLA deadline on creation
SupportTicketSchema.pre('save', function (this: ISupportTicket, next) {
  if (this.isNew && !this.slaDeadline) {
    const SLA_HOURS: Record<string, number> = {
      low: 48,
      medium: 24,
      high: 8,
      urgent: 2,
    };

    const hours = SLA_HOURS[this.priority as string] || 24;
    this.slaDeadline = new Date(Date.now() + (hours * 60 * 60 * 1000));
    
    // Auto-populate initial history if empty
    if (!this.history || this.history.length === 0) {
      this.history = [{
        action: 'ticket_created',
        performedBy: this.createdBy,
        createdAt: new Date(),
      }];
    }
  }
  next();
});

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
