const express = require('express');
const router = express.Router();
const CashFlow = require('../models/CashFlow');
const { protect } = require('../middleware/auth');

// @route   GET /api/cashflow
// @desc    Get all cash flow records with filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, paymentMethod, startDate, endDate } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        filter.date.$lte = eDate;
      }
    }

    const records = await CashFlow.find(filter)
      .populate('createdBy', 'username')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/cashflow/summary
// @desc    Get financial summary (Inflow, Outflow, Net Balance, Method breakdown)
router.get('/summary', protect, async (req, res) => {
  try {
    const inflows = await CashFlow.aggregate([
      { $match: { type: 'inflow' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
    ]);

    const outflows = await CashFlow.aggregate([
      { $match: { type: 'outflow' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
    ]);

    let totalInflow = 0;
    let totalOutflow = 0;
    let cashInflow = 0, cardInflow = 0, bankInflow = 0;
    let cashOutflow = 0, cardOutflow = 0, bankOutflow = 0;

    inflows.forEach(i => {
      totalInflow += i.total;
      if (i._id === 'Cash') cashInflow += i.total;
      if (i._id === 'Card') cardInflow += i.total;
      if (i._id === 'Bank Transfer') bankInflow += i.total;
    });

    outflows.forEach(o => {
      totalOutflow += o.total;
      if (o._id === 'Cash') cashOutflow += o.total;
      if (o._id === 'Card') cardOutflow += o.total;
      if (o._id === 'Bank Transfer') bankOutflow += o.total;
    });

    const netBalance = totalInflow - totalOutflow;
    const cashInDrawer = cashInflow - cashOutflow;
    const netCard = cardInflow - cardOutflow;
    const netBank = bankInflow - bankOutflow;

    res.json({
      success: true,
      summary: {
        totalInflow,
        totalOutflow,
        netBalance,
        cashInDrawer,
        netCard,
        netBank
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cashflow
// @desc    Add manual cash flow entry (Expense or Income)
router.post('/', protect, async (req, res) => {
  try {
    const { type, category, amount, paymentMethod, referenceNo, description, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ success: false, message: 'Type, category and amount are required' });
    }

    const record = new CashFlow({
      type,
      category,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      referenceNo: referenceNo || `VOC-${Date.now().toString().slice(-6)}`,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    await record.save();
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cashflow/:id
// @desc    Delete a cash flow record
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await CashFlow.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
