const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const PaymentHistory = require('../models/PaymentHistory');
const CashFlow = require('../models/CashFlow');
const Settings = require('../models/Settings');
const PosShift = require('../models/PosShift');
const zatcaService = require('../services/zatcaService');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/invoices
// @desc    Get all invoices
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name phone taxNumber crNumber')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/drafts
// @desc    Get all draft invoices
router.get('/drafts', protect, async (req, res) => {
  try {
    const drafts = await Invoice.find({ status: 'draft' })
      .populate('customer', 'name phone')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/due
// @desc    Get all invoices with remaining due amounts
router.get('/due', protect, async (req, res) => {
  const { search } = req.query;
  try {
    const filter = { dueAmount: { $gt: 0 } };
    if (search) {
      filter.invoiceId = { $regex: search, $options: 'i' };
    }

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice details
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'drafts') {
      const drafts = await Invoice.find({ status: 'draft' })
        .populate('customer', 'name phone')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });
      return res.json({ success: true, drafts });
    }

    if (id === 'due') {
      const { search } = req.query;
      const filter = { dueAmount: { $gt: 0 } };
      if (search) filter.invoiceId = { $regex: search, $options: 'i' };
      const invoices = await Invoice.find(filter)
        .populate('customer', 'name phone address')
        .sort({ createdAt: -1 })
        .limit(10);
      return res.json({ success: true, invoices });
    }

    let invoice = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      invoice = await Invoice.findById(id)
        .populate('customer')
        .populate('createdBy', 'username');
    }

    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceId: id })
        .populate('customer')
        .populate('createdBy', 'username');
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Error in GET /api/invoices/:id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/invoices
// @desc    Create a new invoice (POS checkout - Draft or Final with ZATCA QR Code)
router.post('/', protect, authorize('page:view:invoice'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {
    customer_id,
    sub_total,
    item_discount,
    item_tax,
    cart_discount,
    payable_total,
    paid_amount,
    paid_amount_cash = 0,
    paid_amount_card = 0,
    paid_amount_bank = 0,
    due_amount,
    change_amount = 0,
    status = 'final',
    invoice_items = []
  } = req.body;

  try {
    const invoiceId = `INV-${Date.now()}`;
    const itemsList = [];
    const isDraft = status === 'draft';

    // Process each item, check stock, update stock if final
    for (const item of invoice_items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }

      const preStock = product.quantityInStock;
      const newStock = isDraft ? preStock : preStock - Number(item.quantity);

      if (!isDraft) {
        product.quantityInStock = newStock;
        await product.save({ session });
      }

      itemsList.push({
        product: product._id,
        productName: product.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        tax: Number(item.tax || 0),
        discount: Number(item.discount || 0),
        totalPrice: Number(item.total_price),
        preStock: preStock,
        newStock: newStock
      });
    }

    // Generate ZATCA Saudi Arabia Phase 2 TLV Base64 QR Code
    const storeSettings = await Settings.findOne();
    const zatcaQrCode = zatcaService.generateZatcaQrCode({
      sellerName: storeSettings?.shopName || 'KSA Enterprise POS',
      vatNumber: storeSettings?.taxNumber || '310123456700003',
      timestamp: new Date().toISOString(),
      totalAmount: Number(payable_total),
      vatAmount: Number(item_tax || 0)
    });

    // Save Invoice
    const invoice = new Invoice({
      invoiceId,
      customer: customer_id || '660a12e8c253d865c3b1a201',
      subTotal: Number(sub_total),
      itemDiscount: Number(item_discount || 0),
      itemTax: Number(item_tax || 0),
      cartDiscount: Number(cart_discount || 0),
      payableTotal: Number(payable_total),
      paidAmount: Number(paid_amount),
      dueAmount: Number(due_amount),
      paidAmountCash: Number(paid_amount_cash),
      paidAmountCard: Number(paid_amount_card),
      paidAmountBank: Number(paid_amount_bank),
      createdBy: req.user._id,
      status: isDraft ? 'draft' : 'final',
      zatcaQrCode: zatcaQrCode,
      items: itemsList
    });

    const newInvoice = await invoice.save({ session });

    // Update Cashier Active POS Shift if any
    if (!isDraft) {
      const activeShift = await PosShift.findOne({ cashier: req.user._id, status: 'OPEN' }).session(session);
      if (activeShift) {
        activeShift.cashSales = (activeShift.cashSales || 0) + Number(paid_amount_cash);
        activeShift.cardSales = (activeShift.cardSales || 0) + Number(paid_amount_card);
        activeShift.expectedCash = activeShift.openingFloat + activeShift.cashSales;
        await activeShift.save({ session });
      }
    }

    // Log payment history if final & payment made
    if (!isDraft && Number(paid_amount) > 0) {
      const paymentMethods = [];
      if (paid_amount_cash > 0) paymentMethods.push('Cash');
      if (paid_amount_card > 0) paymentMethods.push('Card');
      if (paid_amount_bank > 0) paymentMethods.push('Bank');

      await PaymentHistory.create([{
        invoice: newInvoice._id,
        preDueAmount: Number(payable_total),
        paidAmount: Number(paid_amount),
        dueAmount: Number(due_amount),
        changeAmount: Number(change_amount),
        paymentMethod: paymentMethods.join(', '),
        paidAmountCash: Number(paid_amount_cash),
        paidAmountCard: Number(paid_amount_card),
        paidAmountBank: Number(paid_amount_bank),
        createdBy: req.user._id
      }], { session });

      // Automatically log CashFlow Inflows
      if (paid_amount_cash > 0) {
        await CashFlow.create([{
          type: 'inflow', category: 'Sales Revenue', amount: Number(paid_amount_cash),
          paymentMethod: 'Cash', referenceNo: newInvoice.invoiceId,
          description: `POS Sale Receipt (${newInvoice.invoiceId})`, createdBy: req.user._id
        }], { session });
      }
      if (paid_amount_card > 0) {
        await CashFlow.create([{
          type: 'inflow', category: 'Sales Revenue', amount: Number(paid_amount_card),
          paymentMethod: 'Card', referenceNo: newInvoice.invoiceId,
          description: `POS Sale Receipt (${newInvoice.invoiceId})`, createdBy: req.user._id
        }], { session });
      }
      if (paid_amount_bank > 0) {
        await CashFlow.create([{
          type: 'inflow', category: 'Sales Revenue', amount: Number(paid_amount_bank),
          paymentMethod: 'Bank Transfer', referenceNo: newInvoice.invoiceId,
          description: `POS Sale Receipt (${newInvoice.invoiceId})`, createdBy: req.user._id
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, invoiceId: newInvoice._id, invoice: newInvoice, status: newInvoice.status });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/invoices/:id/finalize
// @desc    Convert a Draft Invoice into a Final Invoice & deduct stock
router.put('/:id/finalize', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    let invoice = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      invoice = await Invoice.findById(id).session(session);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceId: id }).session(session);
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'final') {
      return res.json({ success: true, message: 'Invoice is already finalized', invoiceId: invoice._id });
    }

    // Deduct stock for items
    for (const item of invoice.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        item.preStock = product.quantityInStock;
        product.quantityInStock = product.quantityInStock - item.quantity;
        item.newStock = product.quantityInStock;
        await product.save({ session });
      }
    }

    invoice.status = 'final';
    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Invoice finalized successfully', invoiceId: invoice._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    let invoice = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      invoice = await Invoice.findByIdAndDelete(id);
    }
    if (!invoice) {
      invoice = await Invoice.findOneAndDelete({ invoiceId: id });
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
