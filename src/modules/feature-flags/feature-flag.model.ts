import { Schema, model, Document, Types } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  name: string;
  description?: string;
  enabledGlobal: boolean;
  perOrganizationEnabled: boolean;
  enabledOrganizations: Types.ObjectId[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    enabledGlobal: {
      type: Boolean,
      default: false,
    },
    perOrganizationEnabled: {
      type: Boolean,
      default: false,
    },
    enabledOrganizations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
      },
    ],
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
featureFlagSchema.index({ key: 1 });

export default model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
