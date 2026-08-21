const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  totalBeforeTax: { type: Number, required: true },
  total: { type: Number, required: true },
  preStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 }
});

const PurchaseSchema = new mongoose.Schema({
  purchaseId: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierInvoiceNo: { type: String },
  supplierInvoiceDate: { type: Date },
  purchaseDate: { type: Date, default: Date.now },
  grandTotal: { type: Number, required: true },
  grandTotalBeforeTax: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

PurchaseSchema.add({
  items: [PurchaseItemSchema]
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
