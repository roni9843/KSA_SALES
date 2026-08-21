const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseRequest = require('../models/PurchaseRequest');
const { protect } = require('../middleware/auth');

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier', 'name phone taxNumber')
      .populate('warehouse', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/purchase-orders
// @desc    Create a new Purchase Order (PO)
router.post('/', protect, async (req, res) => {
  try {
    const poNumber = 'PO-' + Date.now().toString().slice(-6);
    const { supplier, warehouse, items, expectedDate, notes } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const po = await PurchaseOrder.create({
      poNumber,
      supplier,
      warehouse,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.quantity) * Number(i.unitPrice)
      })),
      totalAmount,
      expectedDate,
      notes,
      status: 'ISSUED'
    });

    res.status(201).json({ success: true, po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
