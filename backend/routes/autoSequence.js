const express = require('express');
const router = express.Router();
const AutoSequence = require('../models/AutoSequence');
const { protect } = require('../middleware/auth');

// @route   GET /api/auto-sequences
// @desc    Get all document sequences
router.get('/', protect, async (req, res) => {
  try {
    const sequences = await AutoSequence.find().sort({ docType: 1 });
    res.json({ success: true, sequences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auto-sequences
// @desc    Configure / Update a document sequence prefix
router.post('/', protect, async (req, res) => {
  try {
    const { docType, prefix, nextNumber, zeroPad } = req.body;
    const seq = await AutoSequence.findOneAndUpdate(
      { docType },
      { prefix, nextNumber: Number(nextNumber), zeroPad: Number(zeroPad) },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, sequence: seq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auto-sequences/next/:docType
// @desc    Generate next sequence number (e.g. INV-00001) and auto increment
router.get('/next/:docType', protect, async (req, res) => {
  try {
    const { docType } = req.params;
    let seq = await AutoSequence.findOne({ docType });

    if (!seq) {
      seq = await AutoSequence.create({ docType, prefix: docType, nextNumber: 1, zeroPad: 5 });
    }

    const paddedNum = String(seq.nextNumber).padStart(seq.zeroPad, '0');
    const formattedNo = `${seq.prefix}-${paddedNum}`;

    seq.nextNumber += 1;
    await seq.save();

    res.json({ success: true, documentNumber: formattedNo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
