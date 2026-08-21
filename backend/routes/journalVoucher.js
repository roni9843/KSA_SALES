const express = require('express');
const router = express.Router();
const JournalVoucher = require('../models/JournalVoucher');
const Account = require('../models/Account');
const { protect } = require('../middleware/auth');

// @route   GET /api/journal-vouchers
// @desc    Get all Journal Vouchers
router.get('/', protect, async (req, res) => {
  try {
    const vouchers = await JournalVoucher.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/journal-vouchers
// @desc    Post a new Journal Voucher (with strict Debit = Credit balance validation)
router.post('/', protect, async (req, res) => {
  try {
    const { voucherDate, description, entries } = req.body;
    const voucherNo = 'JV-' + Date.now().toString().slice(-6);

    let totalDebit = 0;
    let totalCredit = 0;

    entries.forEach(entry => {
      totalDebit += parseFloat(entry.debit) || 0;
      totalCredit += parseFloat(entry.credit) || 0;
    });

    // Double-Entry Balancing Check
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Unbalanced Journal Voucher! Total Debit (${totalDebit}) must equal Total Credit (${totalCredit}).`
      });
    }

    const voucher = await JournalVoucher.create({
      voucherNo,
      voucherDate: voucherDate || Date.now(),
      description,
      entries,
      totalDebit,
      totalCredit,
      status: 'POSTED',
      createdBy: req.user._id
    });

    // Update individual account balances
    for (const entry of entries) {
      const account = await Account.findById(entry.accountId);
      if (account) {
        const netChange = (parseFloat(entry.debit) || 0) - (parseFloat(entry.credit) || 0);
        account.balance += netChange;
        await account.save();
      }
    }

    res.status(201).json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
