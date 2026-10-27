import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'hr_admin' | 'manager' | 'employee';
  department: string;
  position: string;
  managerId?: mongoose.Types.ObjectId | null;
  phone?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['hr_admin', 'manager', 'employee'],
      default: 'employee',
      required: true,
    },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
