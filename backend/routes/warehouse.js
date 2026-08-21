const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const StockTransfer = require('../models/StockTransfer');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/warehouses
// @desc    Get all warehouses
router.get('/', protect, async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json({ success: true, warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/warehouses
// @desc    Create a new warehouse
router.post('/', protect, async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/warehouses/transfers
// @desc    Get stock transfer orders
router.get('/transfers', protect, async (req, res) => {
  try {
    const transfers = await StockTransfer.find()
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('items.productId', 'name sku')
      .sort({ createdAt: -1 });

    res.json({ success: true, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/warehouses/transfers
// @desc    Initiate an inter-warehouse stock transfer
router.post('/transfers', protect, async (req, res) => {
  try {
    const { sourceWarehouse, destinationWarehouse, items, notes } = req.body;
    const transferNo = 'TRF-' + Date.now().toString().slice(-6);

    const transfer = await StockTransfer.create({
      transferNo,
      sourceWarehouse,
      destinationWarehouse,
      items,
      notes,
      status: 'DISPATCHED'
    });

    res.status(201).json({ success: true, transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
