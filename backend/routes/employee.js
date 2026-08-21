const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees
router.get('/', protect, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Create a new employee profile
router.post('/', protect, async (req, res) => {
  try {
    const employeeCode = 'EMP-' + Date.now().toString().slice(-5);
    const employee = await Employee.create({
      ...req.body,
      employeeCode
    });
    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/employees/document-alerts
// @desc    Check employees with Iqama / Passport expiring in next 30 days
router.get('/document-alerts', protect, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringEmployees = await Employee.find({
      $or: [
        { iqamaExpiryDate: { $lte: thirtyDaysFromNow } },
        { passportExpiryDate: { $lte: thirtyDaysFromNow } }
      ]
    });

    res.json({ success: true, expiringEmployees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
