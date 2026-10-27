import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'manager' | 'employee';
  createdBy: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: [true, 'Announcement title is required'], trim: true },
    content: { type: String, required: [true, 'Content is required'], trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    targetRole: {
      type: String,
      enum: ['all', 'manager', 'employee'],
      default: 'all',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema);
