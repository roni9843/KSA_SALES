const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  taskNumber: { type: String, required: true, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: { type: String },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'], default: 'TODO' }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
