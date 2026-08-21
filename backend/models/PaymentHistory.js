const mongoose = require('mongoose');

const PaymentHistorySchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  paymentDate: { type: Date, default: Date.now },
  preDueAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  dueAmount: { type: Number, required: true },
  changeAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true }, // comma separated methods or aggregated
  paidAmountCash: { type: Number, default: 0 },
  paidAmountCard: { type: Number, default: 0 },
  paidAmountBank: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentHistory', PaymentHistorySchema);
