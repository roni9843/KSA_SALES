const mongoose = require('mongoose');

const TaxExemptionSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  ruleName: { type: String, required: true },
  exemptionCertificateNo: { type: String, required: true },
  customerType: { type: String, default: 'GOVERNMENT' },
  vatRate: { type: Number, default: 0 }, // 0% for tax exempt
  validUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('TaxExemption', TaxExemptionSchema);
