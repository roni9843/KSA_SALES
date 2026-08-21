const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { protect, authorize } = require('../middleware/auth');

const Merchant = require('../models/Merchant');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register-merchant
// @desc    Register new merchant shop & owner user
router.post('/register-merchant', async (req, res) => {
  const { shopName, ownerName, email, phone, address, username, password } = req.body;

  try {
    const existingMerchant = await Merchant.findOne({ email });
    if (existingMerchant) {
      return res.status(400).json({ success: false, message: 'A store with this email already exists.' });
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
      address
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

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Merchant store registered successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        merchant: {
          id: merchant._id,
          shopName: merchant.shopName,
          email: merchant.email
        }
      }
    });
  } catch (error) {
    console.error('Merchant registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username })
      .populate('merchant')
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });

    if (user && (await user.comparePassword(password))) {
      const roles = user.roles.map(r => r.name);
      const isSuper = roles.includes('supperAdmin');

      // Aggregate permissions
      const permissions = [];
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(p => {
            permissions.push(p.name);
          });
        }
      });

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          merchant: user.merchant ? {
            id: user.merchant._id,
            shopName: user.merchant.shopName,
            email: user.merchant.email,
            subscriptionStatus: user.merchant.subscriptionStatus
          } : null,
          roles: roles,
          permissions: isSuper ? ['*'] : permissions
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user (admin only or public if no users exist)
router.post('/register', async (req, res) => {
  const { username, password, roles } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // If roles are not specified, assign 'cashier' role by default
    let assignedRoleIds = [];
    if (roles && roles.length > 0) {
      const roleObjects = await Role.find({ name: { $in: roles } });
      assignedRoleIds = roleObjects.map(r => r._id);
    } else {
      const cashierRole = await Role.findOne({ name: 'cashier' });
      if (cashierRole) {
        assignedRoleIds.push(cashierRole._id);
      }
    }

    const user = await User.create({
      username,
      password,
      roles: assignedRoleIds
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const roles = req.user.roles.map(r => r.name);
    const isSuper = roles.includes('supperAdmin');

    const permissions = [];
    req.user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(p => {
          permissions.push(p.name);
        });
      }
    });

    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        merchant: req.user.merchant ? {
          id: req.user.merchant._id,
          shopName: req.user.merchant.shopName,
          email: req.user.merchant.email,
          subscriptionStatus: req.user.merchant.subscriptionStatus
        } : null,
        roles: roles,
        permissions: isSuper ? ['*'] : permissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (RBAC protect)
router.get('/users', protect, authorize('manage:users'), async (req, res) => {
  try {
    const users = await User.find().populate('roles').select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/users
// @desc    Create a new user by Admin
router.post('/users', protect, authorize('manage:users'), async (req, res) => {
  const { username, password, roles } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const roleObjs = await Role.find({ _id: { $in: roles } });

    const user = await User.create({
      username,
      password,
      roles: roleObjs.map(r => r._id)
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update a user
router.put('/users/:id', protect, authorize('manage:users'), async (req, res) => {
  const { username, password, roles } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.username = username || user.username;
    if (password) {
      user.password = password; // Pre-save hook will hash
    }
    if (roles) {
      user.roles = roles;
    }

    await user.save();
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user
router.delete('/users/:id', protect, authorize('manage:users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.username === 'supperAdmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary superAdmin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/roles
// @desc    Get all roles
router.get('/roles', protect, authorize('manage:users'), async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/roles
// @desc    Create or update a role with permissions
router.post('/roles', protect, authorize('manage:users'), async (req, res) => {
  const { name, permissions } = req.body;
  try {
    let role = await Role.findOne({ name });
    if (role) {
      role.permissions = permissions;
      await role.save();
    } else {
      role = await Role.create({ name, permissions });
    }
    res.json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/permissions
// @desc    Get all available permissions
router.get('/permissions', protect, authorize('manage:users'), async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json({ success: true, permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
