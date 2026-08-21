const mongoose = require('mongoose');

const WorkCenterSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  capacityPerDay: { type: Number, default: 8 }, // Hours per day
  status: { type: String, enum: ['ACTIVE', 'MAINTENANCE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('WorkCenter', WorkCenterSchema);
