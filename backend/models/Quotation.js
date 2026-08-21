const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number,
    totalPrice: Number
  }],
  subTotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  validUntil: { type: Date },
  status: { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED_TO_INVOICE'], default: 'SENT' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);
