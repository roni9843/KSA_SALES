const mongoose = require('mongoose');

const PayslipSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  payslipNo: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // e.g. '2026-08'
  
  basicSalary: { type: Number, required: true },
  totalAllowances: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  
  unpaidLeaveDeduction: { type: Number, default: 0 },
  loanEmiDeduction: { type: Number, default: 0 },
  
  netSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
  wpsExported: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Payslip', PayslipSchema);
