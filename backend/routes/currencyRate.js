const express = require('express');
const router = express.Router();
const CurrencyRate = require('../models/CurrencyRate');
const { protect } = require('../middleware/auth');

// @route   GET /api/currency-rates
// @desc    Get all currency exchange rates
router.get('/', protect, async (req, res) => {
  try {
    let rates = await CurrencyRate.find().sort({ isDefault: -1, currencyCode: 1 });
    if (rates.length === 0) {
      // Seed default SAR
      await CurrencyRate.create({ currencyCode: 'SAR', currencyName: 'Saudi Riyal', symbol: 'SAR', exchangeRate: 1.0, isDefault: true });
      await CurrencyRate.create({ currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', exchangeRate: 3.75, isDefault: false });
      rates = await CurrencyRate.find().sort({ isDefault: -1, currencyCode: 1 });
    }
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/currency-rates
// @desc    Add / Update a currency exchange rate
router.post('/', protect, async (req, res) => {
  try {
    const { currencyCode, currencyName, symbol, exchangeRate, isDefault } = req.body;

    if (isDefault) {
      await CurrencyRate.updateMany({}, { isDefault: false });
    }

    const rate = await CurrencyRate.findOneAndUpdate(
      { currencyCode },
      { currencyName, symbol, exchangeRate: Number(exchangeRate), isDefault: !!isDefault },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, rate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
