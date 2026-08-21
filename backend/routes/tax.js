const express = require('express');
const router = express.Router();
const Tax = require('../models/Tax');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/tax
// @desc    Get all tax rates
router.get('/', protect, async (req, res) => {
  try {
    const taxRates = await Tax.find().sort({ taxPercentage: 1 });
    res.json({ success: true, taxRates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tax
// @desc    Create a tax rate
router.post('/', protect, authorize('page:view:tax-rates'), async (req, res) => {
  const { taxLabel, taxPercentage } = req.body;
  try {
    const tax = await Tax.create({ taxLabel, taxPercentage });
    res.status(201).json({ success: true, taxRate: tax });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tax/:id
// @desc    Delete a tax rate
router.delete('/:id', protect, authorize('page:view:tax-rates'), async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id);
    if (!tax) {
      return res.status(404).json({ success: false, message: 'Tax rate not found' });
    }
    await Tax.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tax rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
