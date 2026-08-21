const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const PaymentHistory = require('../models/PaymentHistory');
const CashFlow = require('../models/CashFlow');
const Settings = require('../models/Settings');
const zatcaService = require('../services/zatcaService');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/invoices
// @desc    Get all invoices
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name')
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
// @desc    Get single invoice details (with fail-safe fallback for drafts/due)
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
// @desc    Create a new invoice (POS checkout - Draft or Final)
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
      items: itemsList
    });

    const newInvoice = await invoice.save({ session });

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

    // Auto-submit to Saudi ZATCA Government Server if final invoice
    if (!isDraft) {
      try {
        const storeSettings = await Settings.findOne();
        if (storeSettings) {
          const zatcaResult = await zatcaService.submitInvoiceToZatca(newInvoice, storeSettings);
          if (zatcaResult?.zatcaStatus) {
            await Invoice.findByIdAndUpdate(newInvoice._id, {
              $set: {
                zatcaStatus: zatcaResult.zatcaStatus,
                zatcaHash: zatcaResult.zatcaHash || '',
                zatcaSubmittedAt: new Date()
              }
            });
          }
        }
      } catch (zatcaErr) {
        console.error('ZATCA Auto-submission error:', zatcaErr.message);
      }
    }

    res.status(201).json({ success: true, invoiceId: newInvoice._id, status: newInvoice.status });
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

    // Log payment history if payment made
    if (invoice.paidAmount > 0) {
      const paymentMethods = [];
      if (invoice.paidAmountCash > 0) paymentMethods.push('Cash');
      if (invoice.paidAmountCard > 0) paymentMethods.push('Card');
      if (invoice.paidAmountBank > 0) paymentMethods.push('Bank');

      await PaymentHistory.create([{
        invoice: invoice._id,
        preDueAmount: invoice.payableTotal,
        paidAmount: invoice.paidAmount,
        dueAmount: invoice.dueAmount,
        changeAmount: 0,
        paymentMethod: paymentMethods.join(', ') || 'Cash',
        paidAmountCash: invoice.paidAmountCash,
        paidAmountCard: invoice.paidAmountCard,
        paidAmountBank: invoice.paidAmountBank,
        createdBy: req.user._id
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Invoice finalized successfully', invoiceId: invoice._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/invoices/collect-due
// @desc    Collect payment on due invoice
router.post('/collect-due', protect, async (req, res) => {
  const { invoiceId, paidByCash = 0, paidByCard = 0, paidByBank = 0 } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const paidAmount = Number(paidByCash) + Number(paidByCard) + Number(paidByBank);
    const preDueAmount = invoice.dueAmount;
    const newDueAmount = preDueAmount - paidAmount;
    
    const finalDueAmount = newDueAmount < 0 ? 0 : newDueAmount;
    const changeAmount = newDueAmount < 0 ? Math.abs(newDueAmount) : 0;

    invoice.paidAmount = invoice.paidAmount + paidAmount;
    invoice.dueAmount = finalDueAmount;
    invoice.paidAmountCash = (invoice.paidAmountCash || 0) + Number(paidByCash);
    invoice.paidAmountCard = (invoice.paidAmountCard || 0) + Number(paidByCard);
    invoice.paidAmountBank = (invoice.paidAmountBank || 0) + Number(paidByBank);

    await invoice.save({ session });

    const paymentMethods = [];
    if (paidByCash > 0) paymentMethods.push('Cash');
    if (paidByCard > 0) paymentMethods.push('Card');
    if (paidByBank > 0) paymentMethods.push('Bank');

    await PaymentHistory.create([{
      invoice: invoice._id,
      preDueAmount,
      paidAmount,
      dueAmount: finalDueAmount,
      changeAmount,
      paymentMethod: paymentMethods.join(', '),
      paidAmountCash: Number(paidByCash),
      paidAmountCard: Number(paidByCard),
      paidAmountBank: Number(paidByBank),
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Payment collected successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/:id/payment-history
// @desc    Get payment history list of an invoice
router.get('/:id/payment-history', protect, async (req, res) => {
  try {
    const history = await PaymentHistory.find({ invoice: req.params.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/:id/last-payment
// @desc    Get last payment details of an invoice
router.get('/:id/last-payment', protect, async (req, res) => {
  try {
    const lastPayment = await PaymentHistory.findOne({ invoice: req.params.id })
      .populate({
        path: 'invoice',
        populate: { path: 'customer' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, lastPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/invoices/customer/payment-history
// @desc    Get global payment histories across all invoices
router.get('/customer/payment-history-global', protect, async (req, res) => {
  try {
    const history = await PaymentHistory.find()
      .populate({
        path: 'invoice',
        populate: { path: 'customer', select: 'name phone' }
      })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice (draft or cancelled)
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
