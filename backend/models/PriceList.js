const mongoose = require('mongoose');

const PriceListItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customPrice: { type: Number, required: true }
});

const PriceListSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  name: { type: String, required: true }, // e.g. Wholesale, Retail, Corporate
  description: { type: String },
  items: [PriceListItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('PriceList', PriceListSchema);
