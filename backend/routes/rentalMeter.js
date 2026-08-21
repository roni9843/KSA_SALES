const express = require('express');
const router = express.Router();
const RentalMeter = require('../models/RentalMeter');
const { protect } = require('../middleware/auth');

// @route   GET /api/rental-meters
// @desc    Get all rental meter readings
router.get('/', protect, async (req, res) => {
  try {
    const meters = await RentalMeter.find()
      .populate('tenant', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, meters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/rental-meters
// @desc    Log meter reading & calculate billed amount
router.post('/', protect, async (req, res) => {
  try {
    const { meterNo, tenant, previousReading, currentReading, ratePerUnit } = req.body;

    const prev = parseFloat(previousReading) || 0;
    const curr = parseFloat(currentReading) || 0;
    const rate = parseFloat(ratePerUnit) || 0;

    const unitsConsumed = curr - prev;
    const billedAmount = Math.max(0, unitsConsumed * rate);

    const meter = await RentalMeter.create({
      meterNo,
      tenant,
      previousReading: prev,
      currentReading: curr,
      ratePerUnit: rate,
      billedAmount,
      status: 'UNBILLED'
    });

    res.status(201).json({ success: true, meter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
