const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const AutoSequence = require('../models/AutoSequence');
const { protect } = require('../middleware/auth');

// GET all quotations
router.get('/', protect, async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('customer').populate('items.product').sort({ createdAt: -1 });
    res.json({ success: true, quotations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new quotation / estimate
router.post('/', protect, async (req, res) => {
  try {
    let seq = await AutoSequence.findOne({ docType: 'ESTIMATE' });
    let nextNum = 1;
    if (seq) {
      nextNum = seq.nextNumber;
      seq.nextNumber += 1;
      await seq.save();
    } else {
      await AutoSequence.create({ docType: 'ESTIMATE', prefix: 'EST', nextNumber: 2 });
    }

    const quotationNumber = `EST-${String(nextNum).padStart(5, '0')}`;
    const { customer, items, subTotal, taxAmount, grandTotal, validUntil } = req.body;

    const quotation = await Quotation.create({
      quotationNumber,
      customer,
      items,
      subTotal,
      taxAmount,
      grandTotal,
      validUntil: validUntil || new Date(Date.now() + 30 * 86400000),
      createdBy: req.user.id
    });

    res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
