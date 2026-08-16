import mongoose from 'mongoose';

export interface ISLAPolicy extends mongoose.Document {
  service_type: string;
  effective_from: Date;
  effective_until?: Date;
  duration_minutes: number;
}

const SLAPolicySchema = new mongoose.Schema({
  service_type: { type: String, required: true },
  effective_from: { type: Date, required: true },
  effective_until: { type: Date },
  duration_minutes: { type: Number, required: true },
});

// Ensure uniqueness constraint matching the SQL schema
SLAPolicySchema.index({ service_type: 1, effective_from: 1 }, { unique: true });

export default mongoose.models.SLAPolicy || mongoose.model<ISLAPolicy>('SLAPolicy', SLAPolicySchema);
