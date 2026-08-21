const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StockAdjustment = require('../models/StockAdjustment');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Helper to generate a unique adjustment number
const generateAdjustmentNo = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `SA${year}${month}${day}`;

  const count = await StockAdjustment.countDocuments({ stockAdjustmentNo: new RegExp(`^${datePrefix}`) });
  const sequence = String(count + 1).padStart(4, '0');
  return `${datePrefix}-${sequence}`;
};

// @route   GET /api/stock/adjustments
// @desc    Get paginated manual stock adjustments list
router.get('/adjustments', protect, async (req, res) => {
  const { startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {};
  if (startDate && endDate) {
    query.stockAdjustmentDate = {
      $gte: new Date(startDate),
      $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
    };
  }

  try {
    const totalCount = await StockAdjustment.countDocuments(query);
    const adjustments = await StockAdjustment.find(query)
      .populate('stockAdjustmentBy', 'username')
      .populate('items.product', 'name')
      .sort({ stockAdjustmentDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Flatten to match the structure expected by the frontend
    const rows = [];
    adjustments.forEach(adj => {
      adj.items.forEach(item => {
        rows.push({
          id: item._id,
          stock_adjustment_no: adj.stockAdjustmentNo,
          stock_adjustment_date: adj.stockAdjustmentDate,
          adjusted_by: adj.stockAdjustmentBy ? adj.stockAdjustmentBy.username : 'Unknown',
          product_name: item.product ? item.product.name : item.productName,
          pre_stock: item.preStock,
          quantity: item.type === 'subtract' ? -item.quantity : item.quantity,
          new_stock: item.newStock
        });
      });
    });

    res.json({ success: true, rows, totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/stock/adjust
// @desc    Perform manual stock adjustments
router.post('/adjust', protect, authorize('page:view:stock'), async (req, res) => {
  const { adjustment_date, items = [] } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stockAdjustmentNo = await generateAdjustmentNo();
    const adjustmentItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found.`);
      }

      const preStock = product.quantityInStock;
      let newStock;

      if (item.type === 'add') {
        newStock = preStock + Number(item.quantity);
      } else if (item.type === 'subtract') {
        newStock = preStock - Number(item.quantity);
      } else {
        throw new Error('Invalid adjustment type. Must be "add" or "subtract".');
      }

      if (newStock < 0) {
        throw new Error(`Stock cannot be negative for product: ${product.name}`);
      }

      product.quantityInStock = newStock;
      await product.save({ session });

      adjustmentItems.push({
        product: product._id,
        productName: product.name,
        quantity: Number(item.quantity),
        type: item.type,
        preStock,
        newStock
      });
    }

    const adjustment = new StockAdjustment({
      stockAdjustmentNo,
      stockAdjustmentDate: adjustment_date || Date.now(),
      stockAdjustmentBy: req.user._id,
      items: adjustmentItems
    });

    await adjustment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: 'Stock adjusted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
