import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILeave extends Document {
  user: mongoose.Types.ObjectId;
  leaveType: 'annual' | 'sick' | 'casual' | 'unpaid';
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewNote?: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'unpaid'],
      required: [true, 'Leave type is required'],
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    days: { type: Number, required: [true, 'Number of days is required'], min: 0.5 },
    reason: { type: String, required: [true, 'Reason is required'], trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Leave: Model<ILeave> = mongoose.models.Leave || mongoose.model<ILeave>('Leave', leaveSchema);
