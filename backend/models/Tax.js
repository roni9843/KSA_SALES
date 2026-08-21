const mongoose = require('mongoose');

const TaxSchema = new mongoose.Schema({
  taxLabel: { type: String, required: true },
  taxPercentage: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tax', TaxSchema);
