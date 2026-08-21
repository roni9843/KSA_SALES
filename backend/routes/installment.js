const express = require('express');
const router = express.Router();
const InstallmentAgreement = require('../models/InstallmentAgreement');
const { protect } = require('../middleware/auth');

// @route   GET /api/installments
// @desc    Get all installment agreements
router.get('/', protect, async (req, res) => {
  try {
    const agreements = await InstallmentAgreement.find()
      .populate('customer', 'name phone')
      .populate('invoiceId', 'invoiceId payableTotal')
      .sort({ createdAt: -1 });

    res.json({ success: true, agreements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/installments
// @desc    Create installment plan for invoice
router.post('/', protect, async (req, res) => {
  try {
    const { invoiceId, customer, totalAmount, downPayment, numberOfInstallments } = req.body;
    const agreementNo = 'INS-' + Date.now().toString().slice(-6);

    const remainingAmount = totalAmount - downPayment;
    const installmentAmount = Math.ceil(remainingAmount / numberOfInstallments);

    const schedule = [];
    let currentDate = new Date();

    for (let i = 1; i <= numberOfInstallments; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        dueDate: new Date(currentDate),
        amount: installmentAmount,
        status: 'PENDING'
      });
    }

    const agreement = await InstallmentAgreement.create({
      agreementNo,
      invoiceId,
      customer,
      totalAmount,
      downPayment,
      numberOfInstallments,
      installmentAmount,
      schedule
    });

    res.status(201).json({ success: true, agreement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
