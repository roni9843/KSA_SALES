const mongoose = require('mongoose');

const PosShiftSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  shiftNumber: { type: String, required: true, unique: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openingFloat: { type: Number, required: true, default: 0 },
  cashSales: { type: Number, default: 0 },
  cardSales: { type: Number, default: 0 },
  expectedCash: { type: Number, default: 0 },
  actualCash: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PosShift', PosShiftSchema);
