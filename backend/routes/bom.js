const express = require('express');
const router = express.Router();
const Bom = require('../models/Bom');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/boms
// @desc    Get all BOM recipes
router.get('/', protect, async (req, res) => {
  try {
    const boms = await Bom.find()
      .populate('finishedGood', 'name code purchasePrice salePrice')
      .sort({ createdAt: -1 });

    res.json({ success: true, boms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/boms
// @desc    Create a new Bill of Materials (BOM) recipe
router.post('/', protect, async (req, res) => {
  try {
    const { finishedGood, outputQuantity = 1, rawMaterials, laborCost = 0, overheadCost = 0 } = req.body;
    const bomNumber = 'BOM-' + Date.now().toString().slice(-6);

    let rawTotal = 0;
    const formattedRaw = [];

    for (const item of rawMaterials) {
      const prod = await Product.findById(item.productId);
      const cost = prod ? prod.purchasePrice : Number(item.unitCost || 0);
      const lineTotal = Number(item.quantity) * cost;
      rawTotal += lineTotal;

      formattedRaw.push({
        productId: item.productId,
        productName: prod ? prod.name : 'Raw Material',
        quantity: Number(item.quantity),
        unitCost: cost,
        totalCost: lineTotal
      });
    }

    const totalBomCost = rawTotal + Number(laborCost) + Number(overheadCost);
    const unitBomCost = totalBomCost / Number(outputQuantity);

    const bom = await Bom.create({
      bomNumber,
      finishedGood,
      outputQuantity: Number(outputQuantity),
      rawMaterials: formattedRaw,
      laborCost: Number(laborCost),
      overheadCost: Number(overheadCost),
      totalBomCost,
      unitBomCost
    });

    res.status(201).json({ success: true, bom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
