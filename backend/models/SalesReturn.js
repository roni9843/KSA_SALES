const mongoose = require('mongoose');

const SalesReturnItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  returnedQuantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  refundAmount: { type: Number, required: true }
});

const SalesReturnSchema = new mongoose.Schema({
  returnId: { type: String, required: true, unique: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  invoiceNumber: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  returnDate: { type: Date, default: Date.now },
  totalRefundAmount: { type: Number, required: true },
  refundMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Store Credit'],
    default: 'Cash'
  },
  reason: {
    type: String,
    enum: ['Defective / Damaged', 'Customer Changed Mind', 'Wrong Item Issued', 'Expired Item', 'Other'],
    default: 'Customer Changed Mind'
  },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [SalesReturnItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('SalesReturn', SalesReturnSchema);
