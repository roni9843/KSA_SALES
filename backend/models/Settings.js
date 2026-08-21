const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  language: { type: String, default: 'en' },
  writingDirection: { type: String, default: 'ltr' },
  colorScheme: { type: String, default: 'light' },
  shopName: { type: String, default: 'Moto POS' },
  shopAddress: { type: String, default: 'Mirpur 10, Dhaka' },
  shopPhone: { type: String, default: '01700000000' },
  shopEmail: { type: String, default: 'example@email.com' },
  shopLogo: { type: String, default: '' },
  taxNumber: { type: String, default: '310123456700003' },
  zatcaEnabled: { type: Boolean, default: true },
  zatcaEnvironment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
  zatcaOtp: { type: String, default: '' },
  zatcaBinaryToken: { type: String, default: '' },
  zatcaSecret: { type: String, default: '' },
  zatcaConnected: { type: Boolean, default: false },
  zatcaRegisteredAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
