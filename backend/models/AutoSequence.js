const mongoose = require('mongoose');

const AutoSequenceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  docType: { 
    type: String, 
    enum: ['INVOICE', 'PO', 'PR', 'JV', 'MO', 'TASK', 'ESTIMATE', 'BOOKING', 'QUOTATION'], 
    required: true, 
    unique: true 
  },
  prefix: { type: String, required: true }, // e.g. 'INV', 'PO', 'KSA-INV'
  nextNumber: { type: Number, default: 1 },
  zeroPad: { type: Number, default: 5 } // e.g. 5 -> 00001
}, { timestamps: true });

module.exports = mongoose.model('AutoSequence', AutoSequenceSchema);
