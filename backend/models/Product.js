const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  purchasePrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  quantityInStock: { type: Number, default: 0 },
  unit: { type: String },
  tax: { type: Number, default: 0 }, // Tax percentage
  markup: { type: Number },
  code: { type: String },
  barcode: { type: String },
  active: { type: Boolean, default: true },
  defaultQuantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
