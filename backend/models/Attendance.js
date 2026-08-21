const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, default: Date.now },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE'], default: 'PRESENT' },
  overtimeHours: { type: Number, default: 0 },
  source: { type: String, enum: ['BIOMETRIC', 'GPS_ESS', 'MANUAL'], default: 'MANUAL' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
