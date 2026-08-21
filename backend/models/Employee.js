const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  employeeCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  department: { type: String, default: 'General' },
  designation: { type: String, default: 'Staff' },
  joiningDate: { type: Date, default: Date.now },
  
  basicSalary: { type: Number, required: true, default: 0 },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  bankDetails: {
    bankName: { type: String },
    iban: { type: String }
  },
  
  iqamaExpiryDate: { type: Date },
  passportExpiryDate: { type: Date },
  
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
