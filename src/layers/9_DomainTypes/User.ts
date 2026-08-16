import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  full_name?: string;
  phone?: string;
  role: string;
  department_code?: string;
  office_code?: string;
  preferred_language: string;
  created_at: Date;
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  full_name: { type: String },
  phone: { type: String },
  role: { type: String, default: 'citizen', enum: ['citizen', 'officer', 'admin'] },
  department_code: { type: String },
  office_code: { type: String },
  preferred_language: { type: String, default: 'en' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
