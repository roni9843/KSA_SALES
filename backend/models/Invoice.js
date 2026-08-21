const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String },
  serialNumber: { type: String },
  batchNumber: { type: String },
  unit: { type: String, default: 'PCS' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  preStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 }
});

const InvoiceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  invoiceType: { type: String, enum: ['INVOICE', 'ESTIMATE', 'CREDIT_NOTE'], default: 'INVOICE' },
  invoiceId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  
  subTotal: { type: Number, required: true },
  itemDiscount: { type: Number, default: 0 },
  itemTax: { type: Number, default: 0 },
  cartDiscount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  payableTotal: { type: Number, required: true },
  
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paidAmountCash: { type: Number, default: 0 },
  paidAmountCard: { type: Number, default: 0 },
  paidAmountBank: { type: Number, default: 0 },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'final', 'cancelled'], default: 'final' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'PAID' },
  
  // ZATCA Saudi Arabia Phase 2 Fields
  zatcaStatus: { type: String, enum: ['REPORTED', 'CLEARED', 'PENDING', 'DISABLED'], default: 'REPORTED' },
  zatcaQrCode: { type: String }, // Base64 TLV string
  zatcaHash: { type: String, default: '' },
  zatcaSubmittedAt: { type: Date, default: Date.now },
  
  items: [InvoiceItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
