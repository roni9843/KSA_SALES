const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Primary' },
  addressLine: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: { type: Boolean, default: false }
});

const CustomerSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  clientType: { type: String, enum: ['INDIVIDUAL', 'CORPORATE'], default: 'INDIVIDUAL' },
  name: { type: String, required: true },
  code: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  photoUrl: { type: String },
  address: { type: String },
  zipCode: { type: String },
  city: { type: String },
  country: { type: String },
  taxNumber: { type: String },
  crNumber: { type: String },
  Uakam_no: { type: String },
  
  // Addresses Array
  addresses: [AddressSchema],
  
  // Group & Staff Mapping
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientGroup' },
  category: { type: String },
  assignedPriceList: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Financial & Credit Controls
  openingBalance: { type: Number, default: 0 },
  openingBalanceType: { type: String, enum: ['DEBIT', 'CREDIT'], default: 'DEBIT' },
  openingBalanceDate: { type: Date, default: Date.now },
  creditLimit: { type: Number, default: 0 },
  creditPeriodDays: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  
  // Statuses
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], default: 'ACTIVE' },
  pinnedStatus: { type: String },
  
  // Notes & Custom Data
  customFields: { type: Map, of: String },
  notes: [{
    note: String,
    isPinned: { type: Boolean, default: false },
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
