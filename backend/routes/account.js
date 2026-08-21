const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect } = require('../middleware/auth');

// @route   GET /api/accounts
// @desc    Get full Chart of Accounts (COA Tree)
router.get('/', protect, async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate('parentAccount', 'name code')
      .sort({ code: 1 });

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/accounts
// @desc    Create a new account in COA
router.post('/', protect, async (req, res) => {
  try {
    const { code, name, accountType, parentAccount, balance } = req.body;
    const account = await Account.create({
      code,
      name,
      accountType,
      parentAccount: parentAccount || null,
      balance: balance || 0
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/accounts/financial-statements
// @desc    Get real-time Profit & Loss and Balance Sheet totals
router.get('/financial-statements', protect, async (req, res) => {
  try {
    const accounts = await Account.find();

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    accounts.forEach(acc => {
      if (acc.accountType === 'ASSET') totalAssets += acc.balance;
      if (acc.accountType === 'LIABILITY') totalLiabilities += acc.balance;
      if (acc.accountType === 'EQUITY') totalEquity += acc.balance;
      if (acc.accountType === 'INCOME') totalIncome += acc.balance;
      if (acc.accountType === 'EXPENSE') totalExpenses += acc.balance;
    });

    const netProfit = totalIncome - totalExpenses;

    res.json({
      success: true,
      statements: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalIncome,
        totalExpenses,
        netProfit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
