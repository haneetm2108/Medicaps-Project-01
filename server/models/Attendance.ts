import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  clockIn: Date;
  clockOut?: Date | null;
  durationMinutes: number;
  status: 'present' | 'half_day' | 'late' | 'absent';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD for fast date queries
    clockIn: { type: Date, required: true },
    clockOut: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'half_day', 'late', 'absent'],
      default: 'present',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent duplicate attendance records per user per calendar day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
