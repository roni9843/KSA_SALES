const mongoose = require('mongoose');

const ClientAttendanceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  membershipType: { type: String, default: 'Gold Membership' },
  status: { type: String, enum: ['CHECKED_IN', 'CHECKED_OUT'], default: 'CHECKED_IN' },
  gateLocation: { type: String, default: 'Main Gym Counter Gate' }
}, { timestamps: true });

module.exports = mongoose.model('ClientAttendance', ClientAttendanceSchema);
