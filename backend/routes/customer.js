const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/customers
// @desc    Get all customers with population
router.get('/', protect, async (req, res) => {
  try {
    const { search, group, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { taxNumber: { $regex: search, $options: 'i' } },
        { crNumber: { $regex: search, $options: 'i' } },
        { Uakam_no: { $regex: search, $options: 'i' } }
      ];
    }
    if (group) query.group = group;
    if (status) query.status = status;

    const customers = await Customer.find(query)
      .populate('group', 'name discountPercentage')
      .populate('assignedStaff', 'name email')
      .sort({ name: 1 });

    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('group')
      .populate('assignedStaff', 'name email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/customers
// @desc    Create a customer
router.post('/', protect, authorize('page:view:customers'), async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/customers/:id/notes
// @desc    Add a note to customer profile
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { note, isPinned } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.notes.push({
      note,
      isPinned: !!isPinned,
      createdBy: req.user ? req.user.username : 'System',
      createdAt: new Date()
    });

    await customer.save();
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update a customer
router.put('/:id', protect, authorize('page:view:customers'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, customer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
router.delete('/:id', protect, authorize('page:view:customers'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
