const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/summary
// @desc    Get dashboard metrics
router.get('/summary', protect, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Todays Sales
    const salesToday = await Invoice.aggregate([
      { $match: { invoiceDate: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$payableTotal' }, count: { $sum: 1 } } }
    ]);

    // Todays Purchases
    const purchasesToday = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]);

    // Total Customer Due
    const totalDue = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$dueAmount' }, count: { $sum: { $cond: [{ $gt: ['$dueAmount', 0] }, 1, 0] } } } }
    ]);

    // Todays Profit
    // We compute: profit = sum( (item.price - product.purchasePrice) * item.quantity )
    // We can do this using Mongoose lookup
    const profitToday = await Invoice.aggregate([
      { $match: { invoiceDate: { $gte: todayStart, $lte: todayEnd } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          profit: {
            $sum: {
              $multiply: [
                { $subtract: ['$items.price', '$productDetails.purchasePrice'] },
                '$items.quantity'
              ]
            }
          }
        }
      }
    ]);

    const availableProducts = await Product.countDocuments({ quantityInStock: { $gt: 0 } });
    const totalCustomers = await Customer.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const draftInvoiceCount = await Invoice.countDocuments({ status: { $regex: /^draft$/i } });

    res.json({
      success: true,
      data: {
        todaysSale: salesToday[0] ? salesToday[0].total : 0,
        todaysPurchase: purchasesToday[0] ? purchasesToday[0].total : 0,
        availableProducts,
        totalCustomerDue: totalDue[0] ? totalDue[0].total : 0,
        todaysProfit: profitToday[0] ? profitToday[0].profit : 0,
        totalCustomers,
        totalSuppliers,
        totalDueInvoices: totalDue[0] ? totalDue[0].count : 0,
        todaysTotalInvoices: salesToday[0] ? salesToday[0].count : 0,
        todaysTotalPurchases: purchasesToday[0] ? purchasesToday[0].count : 0,
        draftInvoiceCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/weekly-summary
// @desc    Get sales & purchases of last 7 days
router.get('/weekly-summary', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sales = await Invoice.aggregate([
      { $match: { invoiceDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$invoiceDate' } },
          totalSales: { $sum: '$payableTotal' }
        }
      }
    ]);

    const purchases = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' } },
          totalPurchases: { $sum: '$grandTotal' }
        }
      }
    ]);

    const summary = {};
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      summary[dayKey] = {
        name: weekDays[d.getDay()],
        sales: 0,
        purchases: 0
      };
    }

    sales.forEach(s => {
      if (summary[s._id]) summary[s._id].sales = s.totalSales;
    });

    purchases.forEach(p => {
      if (summary[p._id]) summary[p._id].purchases = p.totalPurchases;
    });

    res.json({ success: true, data: Object.values(summary) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/recent-invoices
// @desc    Get last 5 invoices
router.get('/recent-invoices', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const formatted = invoices.map(inv => ({
      id: inv.invoiceId,
      customer: inv.customer ? inv.customer.name : 'Walk-in Customer',
      amount: inv.payableTotal.toFixed(2),
      status: inv.dueAmount > 0 ? 'Overdue' : 'Paid'
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/top-selling
// @desc    Get top 5 selling products of last 7 days
router.get('/top-selling', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const topProducts = await Invoice.aggregate([
      { $match: { invoiceDate: { $gte: sevenDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          total_quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { total_quantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
