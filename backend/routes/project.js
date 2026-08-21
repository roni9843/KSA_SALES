const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', protect, async (req, res) => {
  try {
    const projectCode = 'PRJ-' + Date.now().toString().slice(-5);
    const project = await Project.create({
      ...req.body,
      projectCode
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
