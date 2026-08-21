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

    // Helper for generating historical dates (days ago)
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

    console.log('✅ Saudi Merchant & User accounts created.');

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

    const whDmm = await Warehouse.create({
      code: 'WH-DMM',
      name: 'Dammam Eastern Hub (مستودع الدمام المنطقة الشرقية)',
      address: 'First Industrial City, Coastal Highway, Dammam',
      managerName: 'Fahad Al-Khaldi',
      phone: '+966507778899'
    });

    // 4. CATEGORIES & PRODUCTS
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
      quantityInStock: 45,
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
      quantityInStock: 220,
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
      quantityInStock: 650,
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
      quantityInStock: 1200,
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
      quantityInStock: 35,
      alertQuantity: 3,
      unit: 'Piece',
      isSerialTracked: true,
      tax: 15,
      warehouse: whRuh._id
    });

    console.log('✅ Saudi Inventory Products & Categories created.');

    // 5. CLIENT GROUPS & CUSTOMERS
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

    const custRedSea = await Customer.create({
      name: 'Red Sea Global Development Co. (شركة البحر الأحمر الدولية)',
      phone: '+966118009988',
      email: 'contact@redseaglobal.com.sa',
      address: 'Riyadh Digital City, KSA',
      crNumber: '1010554433',
      taxNumber: '310554433200003',
      group: groupCorporate._id,
      creditLimit: 750000
    });

    // 6. SUPPLIERS
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

    // 7. HISTORICAL TAX INVOICES ACROSS THE LAST 30 DAYS WITH ZATCA QR CODE
    const invoiceDates = [30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 1, 0];
    let invSeq = 100;

    for (const d of invoiceDates) {
      invSeq += 1;
      const invDate = daysAgo(d);
      const sub = Math.floor(Math.random() * 25000) + 5000;
      const tax = sub * 0.15;
      const total = sub + tax;

      const zatcaQr = zatcaService.generateZatcaQrCode({
        sellerName: merchant.shopName,
        vatNumber: merchant.taxNumber,
        timestamp: invDate.toISOString(),
        totalAmount: total,
        vatAmount: tax
      });

      const custObj = (invSeq % 2 === 0) ? custAramco : ((invSeq % 3 === 0) ? custBinladin : custSabic);

      await Invoice.create({
        invoiceId: `INV-2026-00${invSeq}`,
        customer: custObj._id,
        subTotal: sub,
        itemTax: tax,
        payableTotal: total,
        paidAmount: total,
        dueAmount: 0,
        paidAmountCash: Math.floor(total * 0.4),
        paidAmountCard: Math.ceil(total * 0.6),
        createdBy: adminUser._id,
        status: 'final',
        zatcaQrCode: zatcaQr,
        createdAt: invDate,
        items: [{
          product: prod1._id,
          productName: prod1.name,
          quantity: 1,
          price: sub,
          tax: tax,
          totalPrice: total
        }]
      });
    }

    console.log('✅ 12+ Historical ZATCA Invoices created over 30-day timeline.');

    // 8. POS SHIFTS ACROSS 30 DAYS
    for (let i = 25; i >= 0; i -= 5) {
      await PosShift.create({
        shiftNumber: `SHIFT-2026-08-${30 - i}`,
        cashier: cashierUser._id,
        openingFloat: 500,
        cashSales: 6800 + i * 50,
        cardSales: 14200 + i * 100,
        expectedCash: 7300 + i * 50,
        actualCash: 7300 + i * 50,
        variance: 0,
        status: 'CLOSED',
        openedAt: daysAgo(i + 0.3),
        closedAt: daysAgo(i)
      });
    }

    // 9. CHART OF ACCOUNTS & HISTORICAL JOURNAL VOUCHERS
    const acc10010 = await Account.create({ code: '10010', name: 'Cash Vault (Riyadh Bank - خزينة الرياض)', accountType: 'ASSET', balance: 84500 });
    const acc10020 = await Account.create({ code: '10020', name: 'Al Rajhi Corporate Bank Account (حساب الراجحي)', accountType: 'ASSET', balance: 650000 });
    const acc10030 = await Account.create({ code: '10030', name: 'Accounts Receivable - Trade Debtors (ذمم مدينين)', accountType: 'ASSET', balance: 15600 });
    const acc20010 = await Account.create({ code: '20010', name: 'Accounts Payable - Trade Creditors (ذمم دائنين)', accountType: 'LIABILITY', balance: 92000 });
    const acc20020 = await Account.create({ code: '20020', name: 'ZATCA VAT Output Payable 15% (ضريبة القيمة المضافة)', accountType: 'LIABILITY', balance: 14200 });
    const acc40010 = await Account.create({ code: '40010', name: 'Commercial Sales Revenue (إيرادات المبيعات)', accountType: 'INCOME', balance: 285000 });
    const acc50010 = await Account.create({ code: '50010', name: 'Cost of Goods Sold - COGS (تكلفة البضاعة المباعة)', accountType: 'EXPENSE', balance: 165000 });
    const acc50020 = await Account.create({ code: '50020', name: 'Staff Wages & WPS Payroll Expense (رواتب الموظفين)', accountType: 'EXPENSE', balance: 48000 });

    for (let j = 28; j >= 2; j -= 7) {
      await JournalVoucher.create({
        voucherNo: `JV-2026-00${Math.floor((30 - j) / 3)}`,
        voucherDate: daysAgo(j),
        description: `Weekly Operations & Electricity Settlement (Week ${Math.floor((30 - j) / 7) + 1})`,
        totalDebit: 4500,
        totalCredit: 4500,
        status: 'POSTED',
        createdBy: adminUser._id,
        createdAt: daysAgo(j),
        entries: [
          { accountId: acc50020._id, accountName: acc50020.name, debit: 4500, credit: 0, memo: 'Weekly Operations Expense' },
          { accountId: acc10010._id, accountName: acc10010.name, debit: 0, credit: 4500, memo: 'Disbursed from Vault' }
        ]
      });
    }

    // 10. CHEQUES
    await Cheque.create({
      chequeNumber: 'CHK-NCB-90812',
      chequeType: 'RECEIVED',
      partyName: 'Saudi Aramco Contracting',
      bankName: 'National Commercial Bank (NCB الأهلي)',
      amount: 45000,
      dueDate: daysAgo(10),
      status: 'CLEARED'
    });

    await Cheque.create({
      chequeNumber: 'CHK-RAJHI-11029',
      chequeType: 'ISSUED',
      partyName: 'Caterpillar Middle East Trading',
      bankName: 'Al Rajhi Corporate Bank',
      amount: 62000,
      dueDate: daysAgo(2),
      status: 'CLEARED'
    });

    await Cheque.create({
      chequeNumber: 'CHK-RIYADH-55012',
      chequeType: 'RECEIVED',
      partyName: 'Saudi Binladin Group',
      bankName: 'Riyadh Bank',
      amount: 85000,
      dueDate: new Date(Date.now() + 5 * 86400000),
      status: 'PENDING'
    });

    // 11. EMPLOYEES & PAYROLL
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
      iqamaExpiryDate: new Date(Date.now() + 15 * 86400000)
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
      payslipNo: 'PAY-202607-EMP0101',
      employee: emp1._id,
      month: '2026-07',
      basicSalary: 5500,
      totalAllowances: 2000,
      overtimePay: 600,
      netSalary: 8100,
      paymentStatus: 'PAID',
      wpsExported: true,
      createdAt: daysAgo(22)
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

    // 12. BOM & MANUFACTURING WORK ORDERS
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

    for (let m = 20; m >= 0; m -= 5) {
      await ManufacturingOrder.create({
        moNumber: `MO-2026-00${80 - Math.floor(m / 5)}`,
        bom: bom1._id,
        finishedGood: prod5._id,
        plannedQuantity: 4,
        producedQuantity: 4,
        targetWarehouse: whRuh._id,
        status: m === 0 ? 'IN_PROGRESS' : 'COMPLETED',
        createdAt: daysAgo(m)
      });
    }

    // 13. PROJECTS, KANBAN TASKS & RENTAL METERS
    const proj1 = await Project.create({
      projectCode: 'PRJ-NEOM-01',
      name: 'Neom Substation Electrical Equipment Installation (مشروع نيوم)',
      customer: custAramco._id,
      budget: 850000,
      status: 'IN_PROGRESS'
    });

    const proj2 = await Project.create({
      projectCode: 'PRJ-REDSEA-02',
      name: 'Red Sea Resort Luxury Infrastructure Setup (مشروع البحر الأحمر)',
      customer: custRedSea._id,
      budget: 1200000,
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

    await Task.create({
      taskNumber: 'TSK-00103',
      project: proj2._id,
      title: 'Inspect PVC Pressure Piping Bundle Delivery',
      priority: 'MEDIUM',
      status: 'TODO',
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

    await RentalMeter.create({
      meterNo: 'MTR-MALAZ-108',
      tenant: custAramco._id,
      previousReading: 8500,
      currentReading: 9950,
      ratePerUnit: 0.90,
      billedAmount: 1305.00,
      status: 'BILLED'
    });

    // 14. AUTO SEQUENCES, TAX EXEMPTIONS & CURRENCIES
    await AutoSequence.create({ docType: 'INVOICE', prefix: 'KSA-INV', nextNumber: 114, zeroPad: 5 });
    await AutoSequence.create({ docType: 'PO', prefix: 'KSA-PO', nextNumber: 18, zeroPad: 5 });
    await AutoSequence.create({ docType: 'JV', prefix: 'KSA-JV', nextNumber: 12, zeroPad: 5 });
    await AutoSequence.create({ docType: 'MO', prefix: 'KSA-MO', nextNumber: 85, zeroPad: 5 });

    await TaxExemption.create({
      ruleName: 'Saudi Aramco Tax Exempt Certificate Exemption',
      exemptionCertificateNo: 'GAZT-EX-998822',
      customerType: 'GOVERNMENT',
      vatRate: 0
    });

    await CurrencyRate.create({ currencyCode: 'SAR', currencyName: 'Saudi Riyal (ريال سعودي)', symbol: 'SAR', exchangeRate: 1.0, isDefault: true });
    await CurrencyRate.create({ currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', exchangeRate: 3.75 });
    await CurrencyRate.create({ currencyCode: 'EUR', currencyName: 'Euro', symbol: '€', exchangeRate: 4.05 });

    // 15. DEVELOPER API KEYS
    await ApiKey.create({
      keyName: 'Shopify / WooCommerce Saudi Portal Connector',
      keySecret: 'sec_live_saudi_enterprise_99887766554433221100',
      permissions: ['read:products', 'write:invoices'],
      rateLimitPerMin: 100,
      status: 'ACTIVE'
    });

    console.log('🎉 Expanded 30-Day Saudi Arabia Enterprise Data Seeder Execution Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
