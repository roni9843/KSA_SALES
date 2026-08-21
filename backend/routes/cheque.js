const express = require('express');
const router = express.Router();
const Cheque = require('../models/Cheque');
const { protect } = require('../middleware/auth');

// @route   GET /api/cheques
// @desc    Get all cheques
router.get('/', protect, async (req, res) => {
  try {
    const cheques = await Cheque.find().sort({ dueDate: 1 });
    res.json({ success: true, cheques });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cheques
// @desc    Add a new cheque to portfolio
router.post('/', protect, async (req, res) => {
  try {
    const cheque = await Cheque.create(req.body);
    res.status(201).json({ success: true, cheque });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cheques/:id/status
// @desc    Update cheque lifecycle status (Pending -> Cleared -> Bounced)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const cheque = await Cheque.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    res.json({ success: true, cheque });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
