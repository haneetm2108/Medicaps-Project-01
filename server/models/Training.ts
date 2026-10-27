import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITrainingEnrollment {
  user: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: 'enrolled' | 'in_progress' | 'completed';
}

export interface ITraining extends Document {
  title: string;
  description: string;
  category: string;
  instructor: string;
  createdBy: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolledEmployees: ITrainingEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    title: { type: String, required: [true, 'Training title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    instructor: { type: String, required: [true, 'Instructor is required'], trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1 },
    enrolledEmployees: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        enrolledAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['enrolled', 'in_progress', 'completed'],
          default: 'enrolled',
        },
      },
    ],
  },
  { timestamps: true }
);

export const Training: Model<ITraining> =
  mongoose.models.Training || mongoose.model<ITraining>('Training', trainingSchema);
