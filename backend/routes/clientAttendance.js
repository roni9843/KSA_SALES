const express = require('express');
const router = express.Router();
const ClientAttendance = require('../models/ClientAttendance');
const { protect } = require('../middleware/auth');

// GET all client attendance logs
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ClientAttendance.find().populate('customer').sort({ checkInTime: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST check-in client
router.post('/', protect, async (req, res) => {
  try {
    const { customer, membershipType, gateLocation } = req.body;
    const log = await ClientAttendance.create({
      customer,
      membershipType: membershipType || 'Gold VIP Pass',
      gateLocation: gateLocation || 'Main Gym Entrance'
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
