const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const { protect } = require('../middleware/auth');

// @route   GET /api/price-lists
// @desc    Get all custom price lists
router.get('/', protect, async (req, res) => {
  try {
    const priceLists = await PriceList.find()
      .populate('items.productId', 'name sku salePrice')
      .sort({ name: 1 });

    res.json({ success: true, priceLists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/price-lists
// @desc    Create a custom price list
router.post('/', protect, async (req, res) => {
  try {
    const priceList = await PriceList.create(req.body);
    res.status(201).json({ success: true, priceList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
