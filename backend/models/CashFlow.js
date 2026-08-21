const mongoose = require('mongoose');

const CashFlowSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['inflow', 'outflow'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Sales Revenue',
      'Customer Due Collection',
      'Supplier Purchase Payout',
      'Shop Rent',
      'Electricity & Utilities',
      'Employee Salary & Bonus',
      'Maintenance & Repairs',
      'Marketing & Ads',
      'Office Supplies',
      'Cash Adjustment',
      'Other Income',
      'Other Expense'
    ]
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer'],
    default: 'Cash'
  },
  referenceNo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CashFlow', CashFlowSchema);
