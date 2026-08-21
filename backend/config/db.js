const mongoose = require('mongoose');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const Settings = require('../models/Settings');

const seedData = async () => {
  try {
    // 1. Seed Permissions
    const permissions = [
      { name: 'page:view:home', description: 'Access the Home page' },
      { name: 'page:view:dashboard', description: 'Access the Dashboard page' },
      { name: 'page:view:category', description: 'Access the Category page' },
      { name: 'page:view:products', description: 'Access the Products pages (Add and List)' },
      { name: 'page:view:invoice', description: 'Access the Invoice pages (Create and List)' },
      { name: 'page:view:customers', description: 'Access the Customers pages (Add and List)' },
      { name: 'page:view:suppliers', description: 'Access the Suppliers pages (Add and List)' },
      { name: 'page:view:reporting', description: 'Access the Reporting page' },
      { name: 'page:view:tax-rates', description: 'Access the Tax Rates page' },
      { name: 'page:view:my-company', description: 'Access the My Company page' },
      { name: 'page:view:purchase', description: 'Access the Purchase pages (Add and List)' },
      { name: 'page:view:stock', description: 'Access the Stock Adjustment pages' },
      { name: 'manage:users', description: 'Manage users, roles, and permissions' },
    ];

    const permissionIds = [];
    for (const p of permissions) {
      let existingPerm = await Permission.findOne({ name: p.name });
      if (!existingPerm) {
        existingPerm = await Permission.create(p);
        console.log(`Seeded Permission: ${p.name}`);
      }
      permissionIds.push(existingPerm._id);
    }

    // 2. Seed Roles (supperAdmin)
    let superAdminRole = await Role.findOne({ name: 'supperAdmin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'supperAdmin',
        permissions: permissionIds
      });
      console.log('Seeded Role: supperAdmin');
    } else {
      // Keep permissions up-to-date
      superAdminRole.permissions = permissionIds;
      await superAdminRole.save();
    }

    // Seed default cashier role
    let cashierRole = await Role.findOne({ name: 'cashier' });
    if (!cashierRole) {
      const cashierPermNames = [
        'page:view:home',
        'page:view:dashboard',
        'page:view:category',
        'page:view:products',
        'page:view:invoice',
        'page:view:customers',
        'page:view:suppliers'
      ];
      const cashierPermObjs = await Permission.find({ name: { $in: cashierPermNames } });
      const cashierPermIds = cashierPermObjs.map(c => c._id);
      cashierRole = await Role.create({
        name: 'cashier',
        permissions: cashierPermIds
      });
      console.log('Seeded Role: cashier');
    }

    // 3. Seed Default User (supperAdmin / 123456)
    const superAdminUser = await User.findOne({ username: 'supperAdmin' });
    if (!superAdminUser) {
      await User.create({
        username: 'supperAdmin',
        password: '123456', // Will be hashed automatically by pre-save middleware
        roles: [superAdminRole._id]
      });
      console.log('Seeded User: supperAdmin (password: 123456)');
    }

    // 4. Seed Default Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        language: 'en',
        writingDirection: 'ltr',
        colorScheme: 'light',
        shopName: 'Moto POS Cloud',
        shopAddress: 'Mirpur 10, Dhaka',
        shopPhone: '01700000000',
        shopEmail: 'example@email.com',
        shopLogo: ''
      });
      console.log('Seeded default settings');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moto-pos-cloud');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
