const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const CashFlow = require('../models/CashFlow');
const { protect, authorize } = require('../middleware/auth');

// Helper to generate a unique purchase ID
const generatePurchaseId = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const count = await Purchase.countDocuments({ purchaseId: new RegExp(`^${datePrefix}`) });
  const sequence = String(count + 1).padStart(4, '0');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${datePrefix}-${sequence}-${randomPart}`;
};

// @route   GET /api/purchases
// @desc    Get all purchases
router.get('/', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/purchases
// @desc    Create a new purchase
router.post('/', protect, authorize('page:view:purchase'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {
    supplier_id,
    supplier_invoice_no,
    supplier_invoice_date,
    purchase_date,
    grand_total,
    grand_total_before_tax,
    tax_amount = 0,
    discount_amount = 0,
    items = []
  } = req.body;

  try {
    const purchaseId = await generatePurchaseId();
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const preStock = product.quantityInStock;
      const newStock = preStock + Number(item.quantity);

      product.quantityInStock = newStock;
      await product.save({ session });

      purchaseItems.push({
        product: product._id,
        productName: product.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        taxPercentage: Number(item.tax_percentage || 0),
        discountPercentage: Number(item.discount_percentage || 0),
        totalBeforeTax: Number(item.total_before_tax),
        total: Number(item.total),
        preStock: preStock,
        newStock: newStock
      });
    }

    const purchase = new Purchase({
      purchaseId,
      supplier: supplier_id,
      supplierInvoiceNo: supplier_invoice_no,
      supplierInvoiceDate: supplier_invoice_date,
      purchaseDate: purchase_date || Date.now(),
      grandTotal: Number(grand_total),
      grandTotalBeforeTax: Number(grand_total_before_tax),
      taxAmount: Number(tax_amount),
      discountAmount: Number(discount_amount),
      items: purchaseItems
    });

    const newPurchase = await purchase.save({ session });

    // Auto log CashFlow Outflow for Supplier Purchase Payout
    if (Number(grand_total) > 0) {
      await CashFlow.create([{
        type: 'outflow',
        category: 'Supplier Purchase Payout',
        amount: Number(grand_total),
        paymentMethod: 'Cash',
        referenceNo: newPurchase.purchaseId,
        description: `Supplier Purchase Payment (${newPurchase.supplierInvoiceNo || newPurchase.purchaseId})`,
        createdBy: req.user._id
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, purchase: newPurchase });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/purchases/:id
// @desc    Update a purchase metadata
router.put('/:id', protect, authorize('page:view:purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('supplier');

    res.json({ success: true, purchase: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/purchases/:id
// @desc    Delete a purchase (Warning: does not reverse stock for simplicity, matching original desktop logic)
router.delete('/:id', protect, authorize('page:view:purchase'), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
