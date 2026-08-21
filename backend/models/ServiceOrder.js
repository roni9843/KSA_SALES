const mongoose = require('mongoose');

const ServiceOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  orderNo: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  serviceName: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  actualCost: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'IN_SERVICE', 'COMPLETED'], default: 'PENDING' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema);
