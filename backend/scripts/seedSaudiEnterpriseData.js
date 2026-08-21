const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const zatcaService = require('../services/zatcaService');

// Models
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Merchant = require('../models/Merchant');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const StockTransfer = require('../models/StockTransfer');
const Customer = require('../models/Customer');
const ClientGroup = require('../models/ClientGroup');
const Supplier = require('../models/Supplier');
const Invoice = require('../models/Invoice');
const PosShift = require('../models/PosShift');
const InstallmentAgreement = require('../models/InstallmentAgreement');
const PurchaseOrder = require('../models/PurchaseOrder');
const Purchase = require('../models/Purchase');
const Account = require('../models/Account');
const JournalVoucher = require('../models/JournalVoucher');
const Cheque = require('../models/Cheque');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payslip = require('../models/Payslip');
const Bom = require('../models/Bom');
const WorkCenter = require('../models/WorkCenter');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const Project = require('../models/Project');
const Task = require('../models/Task');
const RentalMeter = require('../models/RentalMeter');
const AutoSequence = require('../models/AutoSequence');
const TaxExemption = require('../models/TaxExemption');
const CurrencyRate = require('../models/CurrencyRate');
const ApiKey = require('../models/ApiKey');
const WebhookSubscription = require('../models/WebhookSubscription');
const CashFlow = require('../models/CashFlow');
const Quotation = require('../models/Quotation');
const Booking = require('../models/Booking');
const ClientAttendance = require('../models/ClientAttendance');
const PointCredit = require('../models/PointCredit');
const StockAdjustment = require('../models/StockAdjustment');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data from database...');

    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await Merchant.deleteMany({});
    await Settings.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Warehouse.deleteMany({});
    await StockTransfer.deleteMany({});
    await Customer.deleteMany({});
    await ClientGroup.deleteMany({});
    await Supplier.deleteMany({});
    await Invoice.deleteMany({});
    await PosShift.deleteMany({});
    await InstallmentAgreement.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Purchase.deleteMany({});
    await Account.deleteMany({});
    await JournalVoucher.deleteMany({});
    await Cheque.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Payslip.deleteMany({});
    await Bom.deleteMany({});
    await WorkCenter.deleteMany({});
    await ManufacturingOrder.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await RentalMeter.deleteMany({});
    await AutoSequence.deleteMany({});
    await TaxExemption.deleteMany({});
    await CurrencyRate.deleteMany({});
    await ApiKey.deleteMany({});
    await WebhookSubscription.deleteMany({});
    await CashFlow.deleteMany({});
    await Quotation.deleteMany({});
    await Booking.deleteMany({});
    await ClientAttendance.deleteMany({});
    await PointCredit.deleteMany({});
    await StockAdjustment.deleteMany({});

    console.log('✅ Existing data cleared successfully.');

    const daysAgo = (days) => new Date(Date.now() - days * 86400000);

    // 1. CREATE SAUDI MERCHANT & SETTINGS
    const merchant = await Merchant.create({
      shopName: 'Al-Madaen Trading & Contracting Co. (شركة المدائن للمقاولات والتجارة)',
      ownerName: 'Sheikh Eng. Abdulaziz Al-Saud',
      email: 'info@almadaen.sa',
      phone: '+966114829900',
      address: 'King Fahd Road, Olaya District, Building 450, Riyadh 12214, Kingdom of Saudi Arabia',
      taxNumber: '310492810400003',
      crNumber: '1010349281',
      status: 'active'
    });

    const settings = await Settings.create({
      shopName: merchant.shopName,
      phone: merchant.phone,
      email: merchant.email,
      address: merchant.address,
      taxNumber: merchant.taxNumber,
      crNumber: merchant.crNumber,
      currency: 'SAR',
      taxPercentage: 15
    });

    // 2. CREATE PERMISSIONS, ROLES & USERS
    const permNames = [
      'page:view:home',
      'page:view:dashboard',
      'page:view:category',
      'page:view:products',
      'page:view:invoice',
      'page:view:customers',
      'page:view:suppliers',
      'page:view:reporting',
      'page:view:tax-rates',
      'page:view:my-company',
      'page:view:purchase',
      'page:view:stock',
      'manage:users'
    ];

    const permObjs = [];
    for (const pName of permNames) {
      const p = await Permission.create({ name: pName, description: pName });
      permObjs.push(p);
    }

    const superAdminRole = await Role.create({
      name: 'supperAdmin',
      permissions: permObjs.map(p => p._id)
    });

    const cashierRole = await Role.create({
      name: 'cashier',
      permissions: permObjs.map(p => p._id)
    });

    const adminUser = await User.create({
      username: 'admin',
      password: 'password123',
      email: 'admin@almadaen.sa',
      phoneNumber: '+966114829900',
      fullName: 'Sheikh Eng. Abdulaziz Al-Saud',
      merchant: merchant._id,
      roles: [superAdminRole._id],
      permissions: ['*']
    });

    const cashierUser = await User.create({
      username: 'tariq_pos',
      password: 'password123',
      email: 'tariq@almadaen.sa',
      phoneNumber: '+966509988771',
      fullName: 'Tariq Al-Harbi',
      merchant: merchant._id,
      roles: [cashierRole._id],
      permissions: permNames
    });

    // 3. WAREHOUSES
    const whRuh = await Warehouse.create({
      code: 'WH-RUH',
      name: 'Riyadh Central Logistics Hub (مستودع الرياض المركزى)',
      address: 'Industrial Area 2, Extension Exit 18, Riyadh',
      managerName: 'Mansour Al-Ghamdi',
      phone: '+966501112233',
      isDefault: true
    });

    const whJed = await Warehouse.create({
      code: 'WH-JED',
      name: 'Jeddah Port Distribution Center (مركز توزيع ميناء جدة)',
      address: 'Al-Khumra Industrial Zone, Port Highway, Jeddah',
      managerName: 'Hassan Al-Zahrani',
      phone: '+966504445566'
    });

    // 4. CATEGORIES & PRODUCTS (CATALOG DATA)
    const catHeavy = await Category.create({ name: 'Heavy Equipment & Spare Parts (معدات ثقيلة قطع غيار)' });
    const catElectrical = await Category.create({ name: 'Electrical & Automation Systems (أنظمة كهربائية وأتمتة)' });
    const catPlumbing = await Category.create({ name: 'Plumbing & PVC Piping (أنابيب سباكة والبلاستيك)' });
    const catSafety = await Category.create({ name: 'Safety Gear & PPE (معدات السلامة الحماية الشخصية)' });

    const prod1 = await Product.create({
      sku: 'SKU-CAT-320D',
      code: 'CAT-HYD-01',
      name: 'Caterpillar Hydraulic Pump Assembly 320D (مضخة هيدروليكية كاتربيلر)',
      category: catHeavy._id,
      purchasePrice: 9500,
      salePrice: 12500,
      quantityInStock: 85,
      alertQuantity: 5,
      unit: 'Piece',
      tax: 15,
      isSerialTracked: true,
      warehouse: whRuh._id
    });

    const prod2 = await Product.create({
      sku: 'SKU-SCH-100A',
      code: 'SCH-CB-100A',
      name: 'Schneider Electric 3-Phase Circuit Breaker 100A (قاطع كهربائي شنايدر)',
      category: catElectrical._id,
      purchasePrice: 310,
      salePrice: 450,
      quantityInStock: 480,
      alertQuantity: 20,
      unit: 'Piece',
      tax: 15,
      warehouse: whRuh._id
    });

    const prod3 = await Product.create({
      sku: 'SKU-HLM-BLU',
      code: 'SAU-HLM-BLU',
      name: 'Saudi Fiber Glass Safety Helmet - Blue (خوذة سلامة فيبر جلاس)',
      category: catSafety._id,
      purchasePrice: 42,
      salePrice: 65,
      quantityInStock: 1200,
      alertQuantity: 30,
      unit: 'Piece',
      tax: 15,
      warehouse: whRuh._id
    });

    const prod4 = await Product.create({
      sku: 'SKU-PVC-110MM',
      code: 'SAU-PVC-110',
      name: 'Arabian PVC Pressure Pipe 110mm Class 5 (أنبوب بلاستيك ضغط عالي)',
      category: catPlumbing._id,
      purchasePrice: 85,
      salePrice: 120,
      quantityInStock: 2500,
      alertQuantity: 50,
      unit: 'Bar',
      subUnits: [{ unitName: 'Bundle (10 Bars)', multiplier: 10 }],
      tax: 15,
      warehouse: whRuh._id
    });

    // 5. SUPPLIERS DIRECTORY
    const suppCat = await Supplier.create({
      name: 'Caterpillar Middle East Trading FZE (كاتربيلر الشرق الأوسط)',
      phone: '+97148835000',
      email: 'sales@cat-me.com',
      address: 'Jebel Ali Free Zone, Dubai / Riyadh Office',
      taxNumber: '310998877600003',
      crNumber: '1010998877',
      creditLimit: 800000
    });

    const suppSchneider = await Supplier.create({
      name: 'Schneider Electric Saudi Arabia Ltd. (شنايدر إلكتريك السعودية)',
      phone: '+966112651100',
      email: 'orders.sa@se.com',
      address: 'Riyadh Second Industrial City, KSA',
      taxNumber: '300123987600003',
      crNumber: '1010123987',
      creditLimit: 400000
    });

    // 6. PURCHASE ORDERS DIRECTORY (POS)
    for (let p = 1; p <= 8; p++) {
      await PurchaseOrder.create({
        poNumber: `KSA-PO-2026-000${p}`,
        supplier: p % 2 === 0 ? suppCat._id : suppSchneider._id,
        warehouse: whRuh._id,
        items: [
          { productId: prod1._id, productName: prod1.name, quantity: 2 * p, unitPrice: 9500, totalPrice: 19000 * p }
        ],
        totalAmount: 19000 * p,
        shippingCost: 1500,
        customsFee: 2500,
        status: 'ISSUED',
        createdAt: daysAgo(p * 10)
      });
    }

    // 7. STOCK ADJUSTMENT LOG HISTORY
    await StockAdjustment.create({
      stockAdjustmentNo: 'SA-2026-001',
      stockAdjustmentDate: daysAgo(5),
      stockAdjustmentBy: adminUser._id,
      items: [{
        product: prod1._id,
        productName: prod1.name,
        quantity: 5,
        type: 'add',
        preStock: 80,
        newStock: 85
      }]
    });

    // 8. EMPLOYEES DIRECTORY & ATTENDANCE & PAYROLL
    const emp1 = await Employee.create({
      employeeCode: 'EMP-0101',
      name: 'Tariq Al-Harbi (طارق الحربي)',
      email: 'tariq@almadaen.sa',
      phone: '+966509988771',
      department: 'Sales & POS Counter',
      designation: 'Senior POS Cashier',
      basicSalary: 5500,
      allowances: { hra: 1500, transport: 500 },
      bankDetails: { bankName: 'Al Rajhi Bank', iban: 'SA1280000450608010112233' },
      iqamaExpiryDate: new Date(Date.now() + 300 * 86400000)
    });

    const emp2 = await Employee.create({
      employeeCode: 'EMP-0102',
      name: 'Faisal Al-Otaibi (فيصل العتيبي)',
      email: 'faisal@almadaen.sa',
      phone: '+966509988772',
      department: 'Finance & Accounts',
      designation: 'Finance Manager',
      basicSalary: 12000,
      allowances: { hra: 3000, transport: 1000 },
      bankDetails: { bankName: 'Riyadh Bank', iban: 'SA5520000110022003300440' },
      iqamaExpiryDate: new Date(Date.now() + 360 * 86400000)
    });

    for (let att = 1; att <= 10; att++) {
      await Attendance.create({
        employee: emp1._id,
        date: daysAgo(att),
        clockIn: '08:00 AM',
        clockOut: '05:00 PM',
        overtimeHours: att % 2 === 0 ? 2 : 0,
        status: 'PRESENT'
      });
    }

    await Payslip.create({
      payslipNo: 'PAY-202608-EMP0101',
      employee: emp1._id,
      month: '2026-08',
      basicSalary: 5500,
      totalAllowances: 2000,
      overtimePay: 450,
      netSalary: 7950,
      paymentStatus: 'PAID',
      wpsExported: true
    });

    // 9. CLIENTS & INVOICES
    const groupCorporate = await ClientGroup.create({ name: 'Tier-1 Saudi Corporate Clients' });
    const custAramco = await Customer.create({
      name: 'Saudi Aramco Overseas Contracting (شركة أرامكو السعودية)',
      phone: '+966138720111',
      email: 'procurement@aramco.com.sa',
      address: 'Dhahran Headquarters, Eastern Province, KSA',
      crNumber: '2050000182',
      taxNumber: '300000000100003',
      group: groupCorporate._id,
      openingBalance: 0,
      creditLimit: 1000000,
      walletBalance: 85000
    });

    // 10. CHART OF ACCOUNTS & JVS & CHEQUES
    const acc10010 = await Account.create({ code: '10010', name: 'Cash Vault (Riyadh Bank - خزينة الرياض)', accountType: 'ASSET', balance: 185000 });
    const acc10020 = await Account.create({ code: '10020', name: 'Al Rajhi Corporate Bank Account (حساب الراجحي)', accountType: 'ASSET', balance: 1450000 });

    await JournalVoucher.create({
      voucherNo: 'JV-2026-0001',
      voucherDate: new Date(),
      description: 'Monthly Operational Expenses',
      totalDebit: 15000,
      totalCredit: 15000,
      status: 'POSTED',
      createdBy: adminUser._id,
      entries: [
        { accountId: acc10010._id, accountName: acc10010.name, debit: 15000, credit: 0, memo: 'Petty Cash' },
        { accountId: acc10020._id, accountName: acc10020.name, debit: 0, credit: 15000, memo: 'Bank Outflow' }
      ]
    });

    await Cheque.create({
      chequeNumber: 'CHK-NCB-90812',
      chequeType: 'RECEIVED',
      partyName: 'Saudi Aramco Contracting',
      bankName: 'National Commercial Bank (NCB الأهلي)',
      amount: 45000,
      dueDate: daysAgo(10),
      status: 'CLEARED'
    });

    // 11. BOM & MO
    const bom1 = await Bom.create({
      bomNumber: 'BOM-PANEL-400V',
      finishedGood: prod2._id,
      outputQuantity: 1,
      laborCost: 400,
      overheadCost: 200,
      rawMaterials: [{ productId: prod2._id, productName: prod2.name, quantity: 4, unitCost: 310, totalCost: 1240 }],
      totalBomCost: 1440,
      unitBomCost: 1440
    });

    await ManufacturingOrder.create({
      moNumber: 'MO-2026-0085',
      bom: bom1._id,
      finishedGood: prod2._id,
      plannedQuantity: 10,
      producedQuantity: 10,
      targetWarehouse: whRuh._id,
      status: 'COMPLETED'
    });

    // 12. PROJECTS, TASKS & METERS
    const proj1 = await Project.create({
      projectCode: 'PRJ-NEOM-01',
      name: 'Neom Substation Electrical Equipment Installation (مشروع نيوم)',
      customer: custAramco._id,
      budget: 1850000,
      status: 'IN_PROGRESS'
    });

    await Task.create({
      taskNumber: 'TSK-00101',
      project: proj1._id,
      title: 'Dispatch Schneider 3-Phase Breakers to Neom Site',
      priority: 'HIGH',
      status: 'DONE',
      assignee: adminUser._id
    });

    await RentalMeter.create({
      meterNo: 'MTR-OLAYA-402',
      tenant: custAramco._id,
      previousReading: 12400,
      currentReading: 13850,
      ratePerUnit: 0.85,
      billedAmount: 1232.50,
      status: 'BILLED'
    });

    // 13. AUTO SEQUENCES & CURRENCIES
    await AutoSequence.create({ docType: 'INVOICE', prefix: 'KSA-INV', nextNumber: 1050, zeroPad: 5 });
    await AutoSequence.create({ docType: 'PO', prefix: 'KSA-PO', nextNumber: 9, zeroPad: 5 });
    await CurrencyRate.create({ currencyCode: 'SAR', currencyName: 'Saudi Riyal (ريال سعودي)', symbol: 'SAR', exchangeRate: 1.0, isDefault: true });

    console.log('🎉 Comprehensive Data Seeding Execution Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
