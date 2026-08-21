const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  allocatedLandedCost: { type: Number, default: 0 }, // Freight/Customs allocated per unit
  effectiveUnitCost: { type: Number, required: true }, // Base Price + Allocated Landed Cost
  taxPercentage: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  totalBeforeTax: { type: Number, required: true },
  total: { type: Number, required: true },
  preStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 }
});

const PurchaseSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  purchaseId: { type: String, required: true, unique: true },
  poNumber: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  supplierInvoiceNo: { type: String },
  supplierInvoiceDate: { type: Date },
  purchaseDate: { type: Date, default: Date.now },
  
  landedCostShipping: { type: Number, default: 0 },
  landedCostCustoms: { type: Number, default: 0 },
  
  grandTotalBeforeTax: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  
  items: [PurchaseItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
