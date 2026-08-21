const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const Bom = require('../models/Bom');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/manufacturing-orders
// @desc    Get all manufacturing work orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await ManufacturingOrder.find()
      .populate('bom')
      .populate('finishedGood', 'name code quantityInStock')
      .populate('targetWarehouse', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/manufacturing-orders
// @desc    Create a new Manufacturing Work Order
router.post('/', protect, async (req, res) => {
  try {
    const { bomId, plannedQuantity, targetWarehouse } = req.body;
    const moNumber = 'MO-' + Date.now().toString().slice(-6);

    const bom = await Bom.findById(bomId);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM recipe not found' });

    const order = await ManufacturingOrder.create({
      moNumber,
      bom: bom._id,
      finishedGood: bom.finishedGood,
      plannedQuantity: Number(plannedQuantity),
      targetWarehouse,
      status: 'DRAFT'
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/manufacturing-orders/:id/status
// @desc    Update Work Order status (DRAFT -> IN_PROGRESS -> COMPLETED with Stock Conversion Engine)
router.put('/:id/status', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const order = await ManufacturingOrder.findById(req.params.id).session(session);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Work Order is already completed' });
    }

    // Execute Stock Conversion Engine if COMPLETED
    if (status === 'COMPLETED') {
      const bom = await Bom.findById(order.bom).session(session);
      if (!bom) throw new Error('Associated BOM recipe not found');

      const multiplier = order.plannedQuantity / bom.outputQuantity;

      // 1. Deduct Raw Materials Stock
      for (const item of bom.rawMaterials) {
        const rawProd = await Product.findById(item.productId).session(session);
        if (rawProd) {
          const neededQty = item.quantity * multiplier;
          rawProd.quantityInStock = Math.max(0, rawProd.quantityInStock - neededQty);
          await rawProd.save({ session });
        }
      }

      // 2. Increment Finished Goods Stock & Cost Price
      const finishedProd = await Product.findById(order.finishedGood).session(session);
      if (finishedProd) {
        finishedProd.quantityInStock += order.plannedQuantity;
        finishedProd.purchasePrice = bom.unitBomCost;
        await finishedProd.save({ session });
      }

      order.producedQuantity = order.plannedQuantity;
      order.endDate = new Date();
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
