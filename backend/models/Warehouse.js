const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String },
  phone: { type: String },
  email: { type: String },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
