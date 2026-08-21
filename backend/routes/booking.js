const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// GET all bookings
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('customer').sort({ bookingDate: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new booking
router.post('/', protect, async (req, res) => {
  try {
    const bookingCode = `BKG-${Math.floor(10000 + Math.random() * 90000)}`;
    const { customer, serviceTitle, bookingDate, timeSlot, price, notes } = req.body;

    const booking = await Booking.create({
      bookingCode,
      customer,
      serviceTitle,
      bookingDate: bookingDate || new Date(),
      timeSlot: timeSlot || '10:00 AM - 11:30 AM',
      price: price || 150,
      notes
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
