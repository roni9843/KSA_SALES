const mongoose = require('mongoose');

const PoItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const PurchaseOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  poDate: { type: Date, default: Date.now },
  expectedDate: { type: Date },
  items: [PoItemSchema],
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['DRAFT', 'ISSUED', 'RECEIVED', 'CANCELLED'], default: 'ISSUED' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
