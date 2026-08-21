const mongoose = require('mongoose');

const PrItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

const PurchaseRequestSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  prNumber: { type: String, required: true, unique: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String },
  items: [PrItemSchema],
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema);
