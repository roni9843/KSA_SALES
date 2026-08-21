const mongoose = require('mongoose');

const ClientGroupSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  name: { type: String, required: true },
  discountPercentage: { type: Number, default: 0 },
  description: { type: String },
  assignedPriceList: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList' }
}, { timestamps: true });

module.exports = mongoose.model('ClientGroup', ClientGroupSchema);
