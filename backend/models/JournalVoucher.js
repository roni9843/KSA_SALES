const mongoose = require('mongoose');

const JvEntrySchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  accountName: { type: String },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  memo: { type: String }
});

const JournalVoucherSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  voucherNo: { type: String, required: true, unique: true },
  voucherDate: { type: Date, default: Date.now },
  description: { type: String },
  entries: [JvEntrySchema],
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'POSTED'], default: 'POSTED' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('JournalVoucher', JournalVoucherSchema);
