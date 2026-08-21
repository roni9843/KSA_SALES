const express = require('express');
const router = express.Router();
const TaxExemption = require('../models/TaxExemption');
const { protect } = require('../middleware/auth');

// @route   GET /api/tax-exemptions
// @desc    Get all VAT Exemption Rules
router.get('/', protect, async (req, res) => {
  try {
    const rules = await TaxExemption.find().sort({ createdAt: -1 });
    res.json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tax-exemptions
// @desc    Create a new VAT Exemption Rule
router.post('/', protect, async (req, res) => {
  try {
    const rule = await TaxExemption.create(req.body);
    res.status(201).json({ success: true, rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
