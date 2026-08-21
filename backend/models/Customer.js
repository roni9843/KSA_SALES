const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  zipCode: { type: String },
  city: { type: String },
  country: { type: String },
  taxNumber: { type: String },
  status: { type: Boolean, default: true },
  Uakam_no: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
