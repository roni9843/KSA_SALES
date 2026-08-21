const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SalesReturn = require('../models/SalesReturn');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const CashFlow = require('../models/CashFlow');
const { protect } = require('../middleware/auth');

// @route   GET /api/returns
// @desc    Get all sales returns
router.get('/', protect, async (req, res) => {
  try {
    const returns = await SalesReturn.find()
      .populate('customer', 'name phone')
      .populate('invoice', 'invoiceId')
      .populate('createdBy', 'username')
      .sort({ returnDate: -1, createdAt: -1 });

    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/returns
// @desc    Process a new Sales Return & Refund
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {
    invoice_id,
    return_items = [],
    refund_method = 'Cash',
    reason = 'Customer Changed Mind',
    notes = ''
  } = req.body;

  try {
    if (!invoice_id || return_items.length === 0) {
      throw new Error('Invoice ID and at least one returned item are required.');
    }

    let invoiceDoc = null;
    if (mongoose.Types.ObjectId.isValid(invoice_id)) {
      invoiceDoc = await Invoice.findById(invoice_id).session(session);
    }
    if (!invoiceDoc) {
      invoiceDoc = await Invoice.findOne({ invoiceId: invoice_id }).session(session);
    }

    if (!invoiceDoc) {
      throw new Error(`Invoice ${invoice_id} not found.`);
    }

    const returnId = `RET-${Date.now().toString().slice(-6)}`;
    const processedItems = [];
    let totalRefundAmount = 0;

    for (const item of return_items) {
      const returnQty = Number(item.returnedQuantity);
      if (returnQty <= 0) continue;

      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found.`);
      }

      // Restock inventory stock
      product.quantityInStock += returnQty;
      await product.save({ session });

      const unitPrice = Number(item.price);
      const taxRate = Number(item.tax || 0);
      const discount = Number(item.discount || 0);
      const itemSubtotal = returnQty * unitPrice;
      const taxAmount = (itemSubtotal - discount) * (taxRate / 100);
      const refundAmount = itemSubtotal - discount + taxAmount;

      totalRefundAmount += refundAmount;

      processedItems.push({
        product: product._id,
        productName: product.name,
        returnedQuantity: returnQty,
        unitPrice: unitPrice,
        tax: taxRate,
        discount: discount,
        refundAmount: refundAmount
      });
    }

    if (processedItems.length === 0) {
      throw new Error('No valid return items were specified.');
    }

    const newReturn = new SalesReturn({
      returnId,
      invoice: invoiceDoc._id,
      invoiceNumber: invoiceDoc.invoiceId,
      customer: invoiceDoc.customer,
      customerName: itemCustomerName(invoiceDoc),
      returnDate: new Date(),
      totalRefundAmount: Number(totalRefundAmount),
      refundMethod: refund_method,
      reason: reason,
      notes: notes,
      createdBy: req.user._id,
      items: processedItems
    });

    await newReturn.save({ session });

    // Automatically record CashFlow Outflow for the Refund
    if (totalRefundAmount > 0) {
      const cashMethod = (refund_method === 'Card' || refund_method === 'Bank Transfer') ? refund_method : 'Cash';
      await CashFlow.create([{
        type: 'outflow',
        category: 'Sales Return & Refund',
        amount: Number(totalRefundAmount),
        paymentMethod: cashMethod,
        referenceNo: returnId,
        description: `Sales Return & Refund for Invoice ${invoiceDoc.invoiceId} (${reason})`,
        createdBy: req.user._id
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, salesReturn: newReturn });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper for customer name lookup
function itemCustomerName(inv) {
  if (inv.customer && inv.customer.name) return inv.customer.name;
  return 'Walk-in Customer';
}

// @route   GET /api/returns/:id
// @desc    Get single sales return details
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    let salesReturn = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      salesReturn = await SalesReturn.findById(id)
        .populate('customer')
        .populate('invoice')
        .populate('createdBy', 'username');
    }

    if (!salesReturn) {
      salesReturn = await SalesReturn.findOne({ returnId: id })
        .populate('customer')
        .populate('invoice')
        .populate('createdBy', 'username');
    }

    if (!salesReturn) {
      return res.status(404).json({ success: false, message: 'Sales return record not found' });
    }

    res.json({ success: true, salesReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
