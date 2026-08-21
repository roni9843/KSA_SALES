const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  code: { type: String, required: true, unique: true }, // e.g. 10000-59999
  name: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'], 
    required: true 
  },
  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  balance: { type: Number, default: 0 },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);
