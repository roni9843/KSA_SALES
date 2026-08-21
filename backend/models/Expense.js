const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  voucherNo: { type: String, required: true, unique: true },
  categoryAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  expenseDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  receiptUrl: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
