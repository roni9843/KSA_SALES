const mongoose = require('mongoose');

const SubUnitSchema = new mongoose.Schema({
  unitName: { type: String, required: true },
  multiplier: { type: Number, required: true } // e.g. Box = 10 Pcs
});

const BundleComponentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

const ProductSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  productType: { type: String, enum: ['STANDARD', 'SERVICE', 'BUNDLE'], default: 'STANDARD' },
  
  purchasePrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  quantityInStock: { type: Number, default: 0 },
  minReorderLevel: { type: Number, default: 5 },
  
  unit: { type: String, default: 'PCS' },
  subUnits: [SubUnitSchema],
  
  tax: { type: Number, default: 0 }, // Tax percentage
  markup: { type: Number },
  code: { type: String },
  barcode: { type: String },
  active: { type: Boolean, default: true },
  defaultQuantity: { type: Number, default: 0 },
  
  // Tracking & Serials
  isSerialTracked: { type: Boolean, default: false },
  isBatchTracked: { type: Boolean, default: false },
  
  // Bundle Products
  bundleComponents: [BundleComponentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
