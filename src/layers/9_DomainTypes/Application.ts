import mongoose from 'mongoose';

export interface IApplication extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  service_type: string;
  status: string;
  applicant_name: string;
  created_at: Date;
  sla_duration_minutes: number;
  sla_deadline: Date;
  breached_at?: Date;
  resolved_at?: Date;
  last_status_change: Date;
  service_payload: any;
  assigned_officer_id?: mongoose.Types.ObjectId;
  department_code: string;
  office_code?: string;
  deleted_at?: Date;
}

const ApplicationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service_type: { type: String, required: true },
  status: { type: String, required: true, default: 'NEW' },
  applicant_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  sla_duration_minutes: { type: Number, required: true },
  sla_deadline: { type: Date, required: true },
  breached_at: { type: Date },
  resolved_at: { type: Date },
  last_status_change: { type: Date, default: Date.now },
  service_payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  assigned_officer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department_code: { type: String, required: true },
  office_code: { type: String },
  deleted_at: { type: Date },
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
