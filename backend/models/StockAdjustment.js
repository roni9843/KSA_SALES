const mongoose = require('mongoose');

const StockAdjustmentItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['add', 'subtract'], required: true },
  preStock: { type: Number, required: true },
  newStock: { type: Number, required: true }
});

const StockAdjustmentSchema = new mongoose.Schema({
  stockAdjustmentNo: { type: String, required: true, unique: true },
  stockAdjustmentDate: { type: Date, default: Date.now },
  stockAdjustmentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [StockAdjustmentItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('StockAdjustment', StockAdjustmentSchema);
