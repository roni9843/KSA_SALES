const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  projectCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  budget: { type: Number, default: 0 },
  status: { type: String, enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'], default: 'PLANNING' }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
