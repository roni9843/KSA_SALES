const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  name: { type: String, required: true },
  code: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  zipCode: { type: String },
  city: { type: String },
  country: { type: String },
  taxNumber: { type: String },
  crNumber: { type: String },
  
  openingBalance: { type: Number, default: 0 },
  openingBalanceType: { type: String, enum: ['DEBIT', 'CREDIT'], default: 'CREDIT' },
  creditLimit: { type: Number, default: 0 },
  
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
