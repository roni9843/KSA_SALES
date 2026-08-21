const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const Role = require('../models/Role');
const { protect } = require('../middleware/auth');

// @route   GET /api/merchants
// @desc    Get all registered merchants (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const merchants = await Merchant.find().sort({ createdAt: -1 });
    
    // Attach total users count to each merchant
    const merchantList = await Promise.all(
      merchants.map(async (m) => {
        const userCount = await User.countDocuments({ merchant: m._id });
        return {
          ...m.toObject(),
          userCount
        };
      })
    );

    res.json({
      success: true,
      merchants: merchantList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/merchants
// @desc    Create new merchant store & owner user by Super Admin
router.post('/', protect, async (req, res) => {
  const { shopName, ownerName, email, phone, address, username, password, subscriptionStatus } = req.body;

  try {
    const existingMerchant = await Merchant.findOne({ email });
    if (existingMerchant) {
      return res.status(400).json({ success: false, message: 'A merchant store with this email already exists.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const merchant = await Merchant.create({
      shopName,
      ownerName,
      email,
      phone,
      address,
      subscriptionStatus: subscriptionStatus || 'trial'
    });

    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.findOne({ name: 'supperAdmin' });
    }

    const user = await User.create({
      username,
      password,
      email,
      phoneNumber: phone,
      fullName: ownerName,
      merchant: merchant._id,
      roles: adminRole ? [adminRole._id] : []
    });

    res.status(201).json({
      success: true,
      message: 'Merchant store created successfully!',
      merchant,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/merchants/:id
// @desc    Update merchant details or subscription status
router.put('/:id', protect, async (req, res) => {
  const { shopName, ownerName, email, phone, address, subscriptionStatus, active } = req.body;

  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    merchant.shopName = shopName !== undefined ? shopName : merchant.shopName;
    merchant.ownerName = ownerName !== undefined ? ownerName : merchant.ownerName;
    merchant.email = email !== undefined ? email : merchant.email;
    merchant.phone = phone !== undefined ? phone : merchant.phone;
    merchant.address = address !== undefined ? address : merchant.address;
    merchant.subscriptionStatus = subscriptionStatus !== undefined ? subscriptionStatus : merchant.subscriptionStatus;
    merchant.active = active !== undefined ? active : merchant.active;

    await merchant.save();

    res.json({
      success: true,
      message: 'Merchant updated successfully',
      merchant
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/merchants/:id
// @desc    Delete merchant and associated users
router.delete('/:id', protect, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    // Delete all users belonging to this merchant
    await User.deleteMany({ merchant: merchant._id });
    
    // Delete merchant
    await Merchant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Merchant store and associated users deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
