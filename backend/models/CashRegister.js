const mongoose = require('mongoose');

const CashRegisterSchema = new mongoose.Schema({
  shiftId: {
    type: String,
    required: true,
    unique: true
  },
  openingBalance: {
    type: Number,
    required: true,
    default: 0
  },
  systemExpectedCash: {
    type: Number,
    required: true,
    default: 0
  },
  physicalActualCash: {
    type: Number,
    default: 0
  },
  discrepancy: {
    type: Number,
    default: 0 // physicalActualCash - systemExpectedCash
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  },
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('CashRegister', CashRegisterSchema);
