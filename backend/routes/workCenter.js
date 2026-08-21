const express = require('express');
const router = express.Router();
const WorkCenter = require('../models/WorkCenter');
const { protect } = require('../middleware/auth');

// @route   GET /api/work-centers
// @desc    Get all work centers
router.get('/', protect, async (req, res) => {
  try {
    const centers = await WorkCenter.find().sort({ code: 1 });
    res.json({ success: true, centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/work-centers
// @desc    Create a new work center
router.post('/', protect, async (req, res) => {
  try {
    const center = await WorkCenter.create(req.body);
    res.status(201).json({ success: true, center });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
