const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get attendance logs
router.get('/', protect, async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate('employee', 'name employeeCode department')
      .sort({ date: -1 });

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/attendance/check-in
// @desc    Log employee check-in (Manual, Biometric, or ESS GPS)
router.post('/check-in', protect, async (req, res) => {
  try {
    const { employeeId, source, status, overtimeHours } = req.body;
    const log = await Attendance.create({
      employee: employeeId,
      date: new Date(),
      checkIn: new Date(),
      source: source || 'MANUAL',
      status: status || 'PRESENT',
      overtimeHours: parseFloat(overtimeHours) || 0
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
