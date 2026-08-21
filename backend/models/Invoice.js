const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // Denormalized for print and reporting convenience
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  preStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoiceDate: { type: Date, default: Date.now },
  subTotal: { type: Number, required: true },
  itemDiscount: { type: Number, default: 0 },
  itemTax: { type: Number, default: 0 },
  cartDiscount: { type: Number, default: 0 },
  payableTotal: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  paidAmountCash: { type: Number, default: 0 },
  paidAmountCard: { type: Number, default: 0 },
  paidAmountBank: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'final', 'cancelled'], default: 'final' },
  zatcaStatus: { type: String, enum: ['REPORTED', 'CLEARED', 'PENDING', 'DISABLED'], default: 'REPORTED' },
  zatcaHash: { type: String, default: '' },
  zatcaSubmittedAt: { type: Date, default: Date.now },
  items: [InvoiceItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
