import mongoose from 'mongoose';

export interface IApplicationEvent extends mongoose.Document {
  application_id: mongoose.Types.ObjectId;
  previous_status?: string;
  new_status: string;
  actor_id?: mongoose.Types.ObjectId;
  actor_type: string;
  changed_at: Date;
  metadata: any;
}

const ApplicationEventSchema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  previous_status: { type: String },
  new_status: { type: String, required: true },
  actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actor_type: { type: String, default: 'system' },
  changed_at: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

export default mongoose.models.ApplicationEvent || mongoose.model<IApplicationEvent>('ApplicationEvent', ApplicationEventSchema);
