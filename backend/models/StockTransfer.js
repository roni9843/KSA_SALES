const mongoose = require('mongoose');

const TransferItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

const StockTransferSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  transferNo: { type: String, required: true, unique: true },
  sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [TransferItemSchema],
  transferDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['DISPATCHED', 'RECEIVED'], default: 'DISPATCHED' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StockTransfer', StockTransferSchema);
