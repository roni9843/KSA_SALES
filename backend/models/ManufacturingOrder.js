const mongoose = require('mongoose');

const ManufacturingOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  moNumber: { type: String, required: true, unique: true },
  bom: { type: mongoose.Schema.Types.ObjectId, ref: 'Bom', required: true },
  finishedGood: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  plannedQuantity: { type: Number, required: true },
  producedQuantity: { type: Number, default: 0 },
  targetWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' }
}, { timestamps: true });

module.exports = mongoose.model('ManufacturingOrder', ManufacturingOrderSchema);
