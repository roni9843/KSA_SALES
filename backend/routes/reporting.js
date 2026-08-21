const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');
const StockAdjustment = require('../models/StockAdjustment');
const { protect } = require('../middleware/auth');

// @route   GET /api/reports/product-sales
// @desc    Get sales history of a product
router.get('/product-sales', protect, async (req, res) => {
  const { productId, startDate, endDate, page = 1, limit = 5 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  const match = { 'items.product': new express.Router().helpers ? null : new mongoose.Types.ObjectId(productId) };
  
  // Let's resolve the object id dynamically
  const mongoose = require('mongoose');
  const prodObjectId = new mongoose.Types.ObjectId(productId);

  const filter = { 'items.product': prodObjectId };

  if (startDate && endDate) {
    filter.invoiceDate = {
      $gte: new Date(startDate),
      $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
    };
  } else {
    // Default to today's sales if no date range is given (matching original desktop logic)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    filter.invoiceDate = { $gte: todayStart, $lte: todayEnd };
  }

  try {
    const totalCountResults = await Invoice.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $match: { 'items.product': prodObjectId } },
      { $count: 'count' }
    ]);
    const totalCount = totalCountResults[0] ? totalCountResults[0].count : 0;

    const data = await Invoice.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $match: { 'items.product': prodObjectId } },
      { $sort: { invoiceDate: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          invoice_id: '$invoiceId',
          invoice_date: '$invoiceDate',
          quantity: '$items.quantity',
          price: '$items.price',
          total_price: '$items.totalPrice'
        }
      }
    ]);

    res.json({ success: true, rows: data, totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reports/product-transactions
// @desc    Get detailed stock transaction history for a product (sales, purchases, adjustments)
router.get('/product-transactions', protect, async (req, res) => {
  const { productId, startDate, endDate, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const mongoose = require('mongoose');

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const prodObjectId = new mongoose.Types.ObjectId(productId);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : new Date();

    // 1. Gather Sales
    const sales = await Invoice.aggregate([
      { $match: { invoiceDate: { $gte: start, $lte: end }, 'items.product': prodObjectId } },
      { $unwind: '$items' },
      { $match: { 'items.product': prodObjectId } },
      {
        $project: {
          date: '$invoiceDate',
          type: { $literal: 'Sale' },
          id: '$invoiceId',
          quantity: { $multiply: ['$items.quantity', -1] },
          pre_stock: '$items.preStock',
          new_stock: '$items.newStock'
        }
      }
    ]);

    // 2. Gather Purchases
    const purchases = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: start, $lte: end }, 'items.product': prodObjectId } },
      { $unwind: '$items' },
      { $match: { 'items.product': prodObjectId } },
      {
        $project: {
          date: '$purchaseDate',
          type: { $literal: 'Purchase' },
          id: '$purchaseId',
          quantity: '$items.quantity',
          pre_stock: '$items.preStock',
          new_stock: '$items.newStock'
        }
      }
    ]);

    // 3. Gather Stock Adjustments
    const adjustments = await StockAdjustment.aggregate([
      { $match: { stockAdjustmentDate: { $gte: start, $lte: end }, 'items.product': prodObjectId } },
      { $unwind: '$items' },
      { $match: { 'items.product': prodObjectId } },
      {
        $project: {
          date: '$stockAdjustmentDate',
          type: { $literal: 'Stock Adj.' },
          id: '$stockAdjustmentNo',
          quantity: {
            $cond: [
              { $eq: ['$items.type', 'subtract'] },
              { $multiply: ['$items.quantity', -1] },
              '$items.quantity'
            ]
          },
          pre_stock: '$items.preStock',
          new_stock: '$items.newStock'
        }
      }
    ]);

    // Combine and sort
    const combined = [...sales, ...purchases, ...adjustments];
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalCount = combined.length;
    const paginated = combined.slice(skip, skip + Number(limit));

    res.json({ success: true, rows: paginated, totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
