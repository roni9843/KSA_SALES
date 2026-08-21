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

    console.log('✅ Existing data cleared successfully.');

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
      permissions: permObjs.map(p => p._id) // Cashier gets full access to operational pages
    });

    // Super Admin user
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

    // Cashier user
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

    console.log('✅ Saudi Merchant & User accounts created.');

    // 3. CREATE WAREHOUSES
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

    // 4. CREATE CATEGORIES & PRODUCTS
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
      quantityInStock: 24,
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
      quantityInStock: 150,
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
      quantityInStock: 300,
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
      quantityInStock: 500,
      alertQuantity: 50,
      unit: 'Bar',
      subUnits: [{ unitName: 'Bundle (10 Bars)', multiplier: 10 }],
      tax: 15,
      warehouse: whRuh._id
    });

    const prod5 = await Product.create({
      sku: 'SKU-SIE-S71200',
      code: 'SIE-PLC-S7',
      name: 'Siemens Simatic S7-1200 Industrial PLC Module (موديول بي ال سي سيمنز)',
      category: catElectrical._id,
      purchasePrice: 3800,
      salePrice: 4800,
      quantityInStock: 12,
      alertQuantity: 3,
      unit: 'Piece',
      isSerialTracked: true,
      tax: 15,
      warehouse: whRuh._id
    });

    console.log('✅ Saudi Inventory Products & Categories created.');

    // 5. CREATE CLIENT GROUPS & CUSTOMERS
    const groupCorporate = await ClientGroup.create({ name: 'Tier-1 Saudi Corporate Clients' });
    const groupGov = await ClientGroup.create({ name: 'Saudi Government & Municipalities' });

    const custAramco = await Customer.create({
      name: 'Saudi Aramco Overseas Contracting (شركة أرامكو السعودية)',
      phone: '+966138720111',
      email: 'procurement@aramco.com.sa',
      address: 'Dhahran Headquarters, Eastern Province, KSA',
      crNumber: '2050000182',
      taxNumber: '300000000100003',
      group: groupCorporate._id,
      openingBalance: 0,
      creditLimit: 500000,
      walletBalance: 25000
    });

    const custSabic = await Customer.create({
      name: 'SABIC Industrial Plastics Co. (شركة سابك للصناعات)',
      phone: '+966112258000',
      email: 'vendor@sabic.com.sa',
      address: 'Jubail Industrial City, Building 12, KSA',
      crNumber: '1010008321',
      taxNumber: '310000832100003',
      group: groupCorporate._id,
      openingBalance: 12500,
      creditLimit: 250000
    });

    const custBinladin = await Customer.create({
      name: 'Saudi Binladin Group (مجموعة بن لادن السعودية)',
      phone: '+966126643333',
      email: 'info@sbg.com.sa',
      address: 'Al-Andalus District, Prince Sultan St, Jeddah',
      crNumber: '4030001204',
      taxNumber: '300403000100003',
      group: groupGov._id,
      creditLimit: 1000000
    });

    console.log('✅ Saudi Clients & Aramco/SABIC profiles created.');

    // 6. CREATE SUPPLIERS
    const suppCat = await Supplier.create({
      name: 'Caterpillar Middle East Trading FZE (كاتربيلر الشرق الأوسط)',
      phone: '+97148835000',
      email: 'sales@cat-me.com',
      address: 'Jebel Ali Free Zone, Dubai / Riyadh Office',
      taxNumber: '310998877600003',
      crNumber: '1010998877',
      creditLimit: 300000
    });

    const suppSchneider = await Supplier.create({
      name: 'Schneider Electric Saudi Arabia Ltd. (شنايدر إلكتريك السعودية)',
      phone: '+966112651100',
      email: 'orders.sa@se.com',
      address: 'Riyadh Second Industrial City, KSA',
      taxNumber: '300123987600003',
      crNumber: '1010123987',
      creditLimit: 150000
    });

    // 7. CREATE HISTORICAL TAX INVOICES WITH ZATCA BASE64 QR CODE
    const zatcaQr1 = zatcaService.generateZatcaQrCode({
      sellerName: merchant.shopName,
      vatNumber: merchant.taxNumber,
      timestamp: new Date().toISOString(),
      totalAmount: 14375,
      vatAmount: 1875
    });

    const inv1 = await Invoice.create({
      invoiceId: 'INV-2026-00101',
      customer: custAramco._id,
      subTotal: 12500,
      itemTax: 1875,
      payableTotal: 14375,
      paidAmount: 14375,
      dueAmount: 0,
      paidAmountCash: 4375,
      paidAmountCard: 10000,
      createdBy: adminUser._id,
      status: 'final',
      zatcaQrCode: zatcaQr1,
      items: [{
        product: prod1._id,
        productName: prod1.name,
        quantity: 1,
        price: 12500,
        tax: 1875,
        totalPrice: 14375
      }]
    });

    const zatcaQr2 = zatcaService.generateZatcaQrCode({
      sellerName: merchant.shopName,
      vatNumber: merchant.taxNumber,
      timestamp: new Date().toISOString(),
      totalAmount: 5175,
      vatAmount: 675
    });

    const inv2 = await Invoice.create({
      invoiceId: 'INV-2026-00102',
      customer: custSabic._id,
      subTotal: 4500,
      itemTax: 675,
      payableTotal: 5175,
      paidAmount: 2000,
      dueAmount: 3175,
      paidAmountBank: 2000,
      createdBy: adminUser._id,
      status: 'final',
      zatcaQrCode: zatcaQr2,
      items: [{
        product: prod2._id,
        productName: prod2.name,
        quantity: 10,
        price: 450,
        tax: 675,
        totalPrice: 5175
      }]
    });

    // 8. POS SHIFT
    await PosShift.create({
      shiftNumber: 'SHIFT-2026-0821-01',
      cashier: cashierUser._id,
      openingFloat: 500,
      cashSales: 4375,
      cardSales: 10000,
      expectedCash: 4875,
      actualCash: 4875,
      variance: 0,
      status: 'CLOSED',
      openedAt: new Date(Date.now() - 28800000),
      closedAt: new Date()
    });

    // 9. CHART OF ACCOUNTS (COA)
    const acc10010 = await Account.create({ code: '10010', name: 'Cash Vault (Riyadh Bank - خزينة الرياض)', accountType: 'ASSET', balance: 14875 });
    const acc10020 = await Account.create({ code: '10020', name: 'Al Rajhi Corporate Bank Account (حساب الراجحي)', accountType: 'ASSET', balance: 250000 });
    const acc10030 = await Account.create({ code: '10030', name: 'Accounts Receivable - Trade Debtors (ذمم مدينين)', accountType: 'ASSET', balance: 3175 });
    const acc20010 = await Account.create({ code: '20010', name: 'Accounts Payable - Trade Creditors (ذمم دائنين)', accountType: 'LIABILITY', balance: 45000 });
    const acc20020 = await Account.create({ code: '20020', name: 'ZATCA VAT Output Payable 15% (ضريبة القيمة المضافة)', accountType: 'LIABILITY', balance: 2550 });
    const acc40010 = await Account.create({ code: '40010', name: 'Commercial Sales Revenue (إيرادات المبيعات)', accountType: 'INCOME', balance: 17000 });
    const acc50010 = await Account.create({ code: '50010', name: 'Cost of Goods Sold - COGS (تكلفة البضاعة المباعة)', accountType: 'EXPENSE', balance: 12600 });
    const acc50020 = await Account.create({ code: '50020', name: 'Staff Wages & WPS Payroll Expense (رواتب الموظفين)', accountType: 'EXPENSE', balance: 24500 });

    // 10. JOURNAL VOUCHERS
    await JournalVoucher.create({
      voucherNo: 'JV-2026-0001',
      voucherDate: new Date(),
      description: 'Monthly Office Electricity & Utility Settlement (SABIC Power Bill)',
      totalDebit: 1500,
      totalCredit: 1500,
      status: 'POSTED',
      createdBy: adminUser._id,
      entries: [
        { accountId: acc50020._id, accountName: acc50020.name, debit: 1500, credit: 0, memo: 'SEC Power Utility Bill' },
        { accountId: acc10010._id, accountName: acc10010.name, debit: 0, credit: 1500, memo: 'Paid Cash Vault' }
      ]
    });

    // 11. CHEQUES
    await Cheque.create({
      chequeNumber: 'CHK-NCB-90812',
      chequeType: 'RECEIVED',
      partyName: 'Saudi Aramco Contracting',
      bankName: 'National Commercial Bank (NCB الأهلي)',
      amount: 14375,
      dueDate: new Date(Date.now() + 864000000),
      status: 'CLEARED'
    });

    // 12. EMPLOYEES & PAYROLL
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
      iqamaExpiryDate: new Date(Date.now() + 15 * 86400000) // 15 days alert
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
      iqamaExpiryDate: new Date(Date.now() + 180 * 86400000)
    });

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

    // 13. BOM & MANUFACTURING
    const bom1 = await Bom.create({
      bomNumber: 'BOM-PANEL-400V',
      finishedGood: prod5._id,
      outputQuantity: 1,
      laborCost: 400,
      overheadCost: 200,
      rawMaterials: [
        { productId: prod2._id, productName: prod2.name, quantity: 4, unitCost: 310, totalCost: 1240 },
        { productId: prod3._id, productName: prod3.name, quantity: 2, unitCost: 42, totalCost: 84 }
      ],
      totalBomCost: 1924,
      unitBomCost: 1924
    });

    await ManufacturingOrder.create({
      moNumber: 'MO-2026-0081',
      bom: bom1._id,
      finishedGood: prod5._id,
      plannedQuantity: 2,
      producedQuantity: 2,
      targetWarehouse: whRuh._id,
      status: 'COMPLETED'
    });

    // 14. PROJECTS, KANBAN TASKS & RENTAL METERS
    const proj1 = await Project.create({
      projectCode: 'PRJ-NEOM-01',
      name: 'Neom Substation Electrical Equipment Installation (مشروع نيوم)',
      customer: custAramco._id,
      budget: 850000,
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

    await Task.create({
      taskNumber: 'TSK-00102',
      project: proj1._id,
      title: 'ZATCA E-Invoicing Phase 2 Compliance Audit',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assignee: adminUser._id
    });

    await RentalMeter.create({
      meterNo: 'MTR-OLAYA-402',
      tenant: custSabic._id,
      previousReading: 12400,
      currentReading: 13850,
      ratePerUnit: 0.85,
      billedAmount: 1232.50,
      status: 'BILLED'
    });

    // 15. AUTO SEQUENCES, TAX EXEMPTIONS & CURRENCIES
    await AutoSequence.create({ docType: 'INVOICE', prefix: 'KSA-INV', nextNumber: 103, zeroPad: 5 });
    await AutoSequence.create({ docType: 'PO', prefix: 'KSA-PO', nextNumber: 12, zeroPad: 5 });
    await AutoSequence.create({ docType: 'JV', prefix: 'KSA-JV', nextNumber: 5, zeroPad: 5 });
    await AutoSequence.create({ docType: 'MO', prefix: 'KSA-MO', nextNumber: 82, zeroPad: 5 });

    await TaxExemption.create({
      ruleName: 'Saudi Aramco Tax Exempt Certificate Exemption',
      exemptionCertificateNo: 'GAZT-EX-998822',
      customerType: 'GOVERNMENT',
      vatRate: 0
    });

    await CurrencyRate.create({ currencyCode: 'SAR', currencyName: 'Saudi Riyal (ريال سعودي)', symbol: 'SAR', exchangeRate: 1.0, isDefault: true });
    await CurrencyRate.create({ currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', exchangeRate: 3.75 });
    await CurrencyRate.create({ currencyCode: 'EUR', currencyName: 'Euro', symbol: '€', exchangeRate: 4.05 });

    // 16. DEVELOPER API KEYS
    await ApiKey.create({
      keyName: 'Shopify / WooCommerce Saudi Portal Connector',
      keySecret: 'sec_live_saudi_enterprise_99887766554433221100',
      permissions: ['read:products', 'write:invoices'],
      rateLimitPerMin: 100,
      status: 'ACTIVE'
    });

    console.log('🎉 Saudi Arabia Enterprise ERP Seeder Execution Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
