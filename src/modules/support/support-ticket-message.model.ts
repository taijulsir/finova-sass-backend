import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupportTicketMessage extends Document {
  ticketId: Types.ObjectId;
  senderType: 'admin' | 'organization';
  senderId: Types.ObjectId;
  message: string;
  attachments: string[];
  createdAt: Date;
}

const SupportTicketMessageSchema: Schema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket', required: true },
    senderType: { type: String, enum: ['admin', 'organization'], required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
SupportTicketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.model<ISupportTicketMessage>('SupportTicketMessage', SupportTicketMessageSchema);
