const mongoose = require('mongoose');

const RentalMeterSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  meterNo: { type: String, required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  previousReading: { type: Number, required: true },
  currentReading: { type: Number, required: true },
  ratePerUnit: { type: Number, required: true },
  billedAmount: { type: Number, required: true },
  status: { type: String, enum: ['UNBILLED', 'BILLED'], default: 'UNBILLED' }
}, { timestamps: true });

module.exports = mongoose.model('RentalMeter', RentalMeterSchema);
