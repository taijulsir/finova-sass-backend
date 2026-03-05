import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SubmissionType {
  CONTACT = 'contact',
  FEEDBACK = 'feedback',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
}

export enum SubmissionStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

export enum SubmissionSource {
  LANDING_PAGE = 'landing_page',
  DASHBOARD = 'dashboard',
}

export interface IContactSubmission extends Document {
  type: SubmissionType;
  name: string;
  email: string;
  company?: string;
  organizationId?: Types.ObjectId;
  subject: string;
  message: string;
  status: SubmissionStatus;
  source: SubmissionSource;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(SubmissionType),
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    company: { type: String, trim: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.NEW,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(SubmissionSource),
      default: SubmissionSource.LANDING_PAGE,
      index: true,
    },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ContactSubmissionSchema.index({ createdAt: -1 });

export default mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
