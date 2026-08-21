const mongoose = require('mongoose');

const BomRawItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true }
});

const BomSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  bomNumber: { type: String, required: true, unique: true },
  finishedGood: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  outputQuantity: { type: Number, default: 1 },
  rawMaterials: [BomRawItemSchema],
  laborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 },
  totalBomCost: { type: Number, required: true },
  unitBomCost: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bom', BomSchema);
