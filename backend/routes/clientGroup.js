const express = require('express');
const router = express.Router();
const ClientGroup = require('../models/ClientGroup');
const { protect } = require('../middleware/auth');

// @route   GET /api/client-groups
// @desc    Get all client groups
router.get('/', protect, async (req, res) => {
  try {
    const groups = await ClientGroup.find().sort({ name: 1 });
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/client-groups
// @desc    Create a client group
router.post('/', protect, async (req, res) => {
  try {
    const group = await ClientGroup.create(req.body);
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/client-groups/:id
// @desc    Update a client group
router.put('/:id', protect, async (req, res) => {
  try {
    const group = await ClientGroup.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/client-groups/:id
// @desc    Delete a client group
router.delete('/:id', protect, async (req, res) => {
  try {
    await ClientGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
