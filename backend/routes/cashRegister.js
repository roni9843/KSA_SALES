const express = require('express');
const router = express.Router();
const CashRegister = require('../models/CashRegister');
const CashFlow = require('../models/CashFlow');
const { protect } = require('../middleware/auth');

// @route   GET /api/cash-register/current
// @desc    Get current active register shift & calculate expected system cash
router.get('/current', protect, async (req, res) => {
  try {
    let currentShift = await CashRegister.findOne({ status: 'open' })
      .populate('openedBy', 'username')
      .sort({ openedAt: -1 });

    if (!currentShift) {
      return res.json({ success: true, activeShift: null, systemExpectedCash: 0 });
    }

    // Calculate Cash Inflows & Outflows since shift openedAt
    const cashInflows = await CashFlow.aggregate([
      { $match: { type: 'inflow', paymentMethod: 'Cash', date: { $gte: currentShift.openedAt } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const cashOutflows = await CashFlow.aggregate([
      { $match: { type: 'outflow', paymentMethod: 'Cash', date: { $gte: currentShift.openedAt } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalCashIn = cashInflows[0] ? cashInflows[0].total : 0;
    const totalCashOut = cashOutflows[0] ? cashOutflows[0].total : 0;
    const systemExpectedCash = currentShift.openingBalance + totalCashIn - totalCashOut;

    res.json({
      success: true,
      activeShift: currentShift,
      totalCashIn,
      totalCashOut,
      systemExpectedCash
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cash-register/open
// @desc    Open a new daily cash register shift
router.post('/open', protect, async (req, res) => {
  try {
    const { openingBalance = 0, notes } = req.body;

    const existingOpen = await CashRegister.findOne({ status: 'open' });
    if (existingOpen) {
      return res.status(400).json({ success: false, message: 'A cash register shift is already open.' });
    }

    const shiftId = `SFT-${Date.now().toString().slice(-6)}`;
    const newShift = new CashRegister({
      shiftId,
      openingBalance: Number(openingBalance),
      systemExpectedCash: Number(openingBalance),
      status: 'open',
      openedAt: new Date(),
      openedBy: req.user._id,
      notes: notes || 'Shift opened'
    });

    await newShift.save();
    res.status(201).json({ success: true, shift: newShift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cash-register/close
// @desc    Close register shift & auto-adjust cash discrepancy
router.post('/close', protect, async (req, res) => {
  try {
    const { physicalActualCash, notes } = req.body;

    let shift = await CashRegister.findOne({ status: 'open' }).sort({ openedAt: -1 });
    if (!shift) {
      return res.status(400).json({ success: false, message: 'No open register shift found.' });
    }

    // Calculate expected system cash
    const cashInflows = await CashFlow.aggregate([
      { $match: { type: 'inflow', paymentMethod: 'Cash', date: { $gte: shift.openedAt } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const cashOutflows = await CashFlow.aggregate([
      { $match: { type: 'outflow', paymentMethod: 'Cash', date: { $gte: shift.openedAt } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalCashIn = cashInflows[0] ? cashInflows[0].total : 0;
    const totalCashOut = cashOutflows[0] ? cashOutflows[0].total : 0;
    const systemExpectedCash = shift.openingBalance + totalCashIn - totalCashOut;
    const actualCash = Number(physicalActualCash);
    const discrepancy = actualCash - systemExpectedCash;

    shift.systemExpectedCash = systemExpectedCash;
    shift.physicalActualCash = actualCash;
    shift.discrepancy = discrepancy;
    shift.status = 'closed';
    shift.closedAt = new Date();
    shift.closedBy = req.user._id;
    if (notes) shift.notes = notes;

    await shift.save();

    // Auto-create Cash Adjustment entry if discrepancy !== 0
    if (discrepancy !== 0) {
      const adjustmentType = discrepancy > 0 ? 'inflow' : 'outflow';
      const adjRecord = new CashFlow({
        type: adjustmentType,
        category: 'Cash Adjustment',
        amount: Math.abs(discrepancy),
        paymentMethod: 'Cash',
        referenceNo: `ADJ-${shift.shiftId}`,
        description: `Automatic cash drawer discrepancy adjustment on shift close (${discrepancy > 0 ? 'Surplus' : 'Shortage'})`,
        date: new Date(),
        createdBy: req.user._id
      });
      await adjRecord.save();
    }

    res.json({ success: true, message: 'Cash register shift closed successfully!', shift, discrepancy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/cash-register/history
// @desc    Get shift history log
router.get('/history', protect, async (req, res) => {
  try {
    const history = await CashRegister.find()
      .populate('openedBy', 'username')
      .populate('closedBy', 'username')
      .sort({ openedAt: -1 })
      .limit(30);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
