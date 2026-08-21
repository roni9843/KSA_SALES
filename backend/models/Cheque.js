const mongoose = require('mongoose');

const ChequeSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  chequeNumber: { type: String, required: true },
  chequeType: { type: String, enum: ['ISSUED', 'RECEIVED'], required: true },
  partyName: { type: String, required: true },
  bankName: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'CLEARED', 'BOUNCED'], default: 'PENDING' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Cheque', ChequeSchema);
