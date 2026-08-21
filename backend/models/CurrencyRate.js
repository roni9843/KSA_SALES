const mongoose = require('mongoose');

const CurrencyRateSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  currencyCode: { type: String, required: true, unique: true }, // e.g. 'SAR', 'USD', 'EUR', 'BDT'
  currencyName: { type: String, required: true },
  symbol: { type: String, default: 'SAR' },
  exchangeRate: { type: Number, required: true, default: 1.0 }, // Base = 1.0 SAR
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('CurrencyRate', CurrencyRateSchema);
