const mongoose = require('mongoose');

const FixedAssetSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  assetCode: { type: String, required: true, unique: true },
  assetName: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  costPrice: { type: Number, required: true },
  salvageValue: { type: Number, default: 0 },
  usefulLifeMonths: { type: Number, required: true }, // Lifespan in months
  monthlyDepreciation: { type: Number, default: 0 },
  accumulatedDepreciation: { type: Number, default: 0 },
  bookValue: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FixedAsset', FixedAssetSchema);
