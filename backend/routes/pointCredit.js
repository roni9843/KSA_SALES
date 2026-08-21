const express = require('express');
const router = express.Router();
const PointCredit = require('../models/PointCredit');
const { protect } = require('../middleware/auth');

// GET all point credits
router.get('/', protect, async (req, res) => {
  try {
    const credits = await PointCredit.find().populate('customer').sort({ createdAt: -1 });
    res.json({ success: true, credits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST award/redeem points
router.post('/', protect, async (req, res) => {
  try {
    const { customer, pointsEarned, pointsRedeemed, transactionType, referenceInvoice, notes } = req.body;
    const netPoints = (pointsEarned || 0) - (pointsRedeemed || 0);

    const lastRecord = await PointCredit.findOne({ customer }).sort({ createdAt: -1 });
    const currentBalance = (lastRecord ? lastRecord.currentBalance : 0) + netPoints;

    const credit = await PointCredit.create({
      customer,
      pointsEarned,
      pointsRedeemed,
      currentBalance,
      transactionType: transactionType || 'EARN',
      referenceInvoice,
      notes
    });

    res.json({ success: true, credit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
