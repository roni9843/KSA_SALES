const mongoose = require('mongoose');

const PointCreditSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  pointsEarned: { type: Number, default: 0 },
  pointsRedeemed: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  transactionType: { type: String, enum: ['EARN', 'REDEEM', 'ADJUSTMENT'], default: 'EARN' },
  referenceInvoice: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PointCredit', PointCreditSchema);
