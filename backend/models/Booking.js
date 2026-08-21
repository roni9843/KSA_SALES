const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  serviceTitle: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 11:30 AM"
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'], default: 'CONFIRMED' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
