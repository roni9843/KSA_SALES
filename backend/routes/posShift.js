const express = require('express');
const router = express.Router();
const PosShift = require('../models/PosShift');
const { protect } = require('../middleware/auth');

// @route   GET /api/pos-shifts/current
// @desc    Get active open shift for logged-in cashier
router.get('/current', protect, async (req, res) => {
  try {
    const shift = await PosShift.findOne({
      cashier: req.user._id,
      status: 'OPEN'
    });
    res.json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pos-shifts/open
// @desc    Open a new POS shift with float amount
router.post('/open', protect, async (req, res) => {
  try {
    const activeShift = await PosShift.findOne({ cashier: req.user._id, status: 'OPEN' });
    if (activeShift) {
      return res.status(400).json({ success: false, message: 'You already have an active OPEN shift!' });
    }

    const shiftNumber = 'SHF-' + Date.now().toString().slice(-6);
    const shift = await PosShift.create({
      shiftNumber,
      cashier: req.user._id,
      openingFloat: req.body.openingFloat || 0,
      expectedCash: req.body.openingFloat || 0,
      status: 'OPEN'
    });

    res.status(201).json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pos-shifts/close
// @desc    Close shift and reconcile drawer cash
router.post('/close', protect, async (req, res) => {
  try {
    const { actualCash } = req.body;
    const shift = await PosShift.findOne({ cashier: req.user._id, status: 'OPEN' });
    if (!shift) {
      return res.status(404).json({ success: false, message: 'No active OPEN shift found!' });
    }

    const variance = (parseFloat(actualCash) || 0) - shift.expectedCash;
    shift.actualCash = parseFloat(actualCash) || 0;
    shift.variance = variance;
    shift.status = 'CLOSED';
    shift.closedAt = new Date();

    await shift.save();
    res.json({ success: true, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
