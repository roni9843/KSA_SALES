const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
  shopName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: 'Bangladesh' },
  businessType: { type: String, default: 'Retail / Moto Parts' },
  logo: { type: String, default: '' },
  subscriptionStatus: { type: String, enum: ['active', 'trial', 'expired', 'suspended'], default: 'trial' },
  subscriptionExpiry: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 day trial
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Merchant', MerchantSchema);
