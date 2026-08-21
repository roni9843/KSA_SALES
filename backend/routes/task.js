const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name projectCode')
      .populate('assignee', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new Task
router.post('/', protect, async (req, res) => {
  try {
    const taskNumber = 'TSK-' + Date.now().toString().slice(-6);
    const task = await Task.create({
      ...req.body,
      taskNumber,
      assignee: req.user._id
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update Task status for Kanban Board movement (TODO -> IN_PROGRESS -> IN_REVIEW -> DONE)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
