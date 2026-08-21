const mongoose = require('mongoose');

const ScheduleItemSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' }
});

const InstallmentAgreementSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  agreementNo: { type: String, required: true, unique: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  totalAmount: { type: Number, required: true },
  downPayment: { type: Number, required: true, default: 0 },
  numberOfInstallments: { type: Number, required: true },
  installmentAmount: { type: Number, required: true },
  schedule: [ScheduleItemSchema],
  status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('InstallmentAgreement', InstallmentAgreementSchema);
