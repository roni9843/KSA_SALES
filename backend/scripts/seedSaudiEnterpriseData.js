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

    console.log('✅ Existing data cleared successfully.');

    // Helper for historical dates (1 Year timeline = up to 365 days ago)
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

    const prod5 = await Product.create({
      sku: 'SKU-SIE-S71200',
      code: 'SIE-PLC-S7',
      name: 'Siemens Simatic S7-1200 Industrial PLC Module (موديول بي ال سي سيمنز)',
      category: catElectrical._id,
      purchasePrice: 3800,
      salePrice: 4800,
      quantityInStock: 65,
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
      creditLimit: 1000000,
      walletBalance: 85000
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
      creditLimit: 500000
    });

    const custBinladin = await Customer.create({
      name: 'Saudi Binladin Group (مجموعة بن لادن السعودية)',
      phone: '+966126643333',
      email: 'info@sbg.com.sa',
      address: 'Al-Andalus District, Prince Sultan St, Jeddah',
      crNumber: '4030001204',
      taxNumber: '300403000100003',
      group: groupGov._id,
      creditLimit: 2000000
    });

    const custRedSea = await Customer.create({
      name: 'Red Sea Global Development Co. (شركة البحر الأحمر الدولية)',
      phone: '+966118009988',
      email: 'contact@redseaglobal.com.sa',
      address: 'Riyadh Digital City, KSA',
      crNumber: '1010554433',
      taxNumber: '310554433200003',
      group: groupCorporate._id,
      creditLimit: 1500000
    });

    // 6. SUPPLIERS
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

    // 7. 50+ HISTORICAL ZATCA TAX INVOICES SPANNING 365 DAYS (1 YEAR)
    let invNumberSeq = 1000;
    const customersList = [custAramco, custSabic, custBinladin, custRedSea];

    for (let day = 360; day >= 0; day -= 7) {
      invNumberSeq += 1;
      const invDate = daysAgo(day);
      const selCust = customersList[invNumberSeq % customersList.length];
      const subTotal = Math.floor(15000 + (day * 120) + Math.random() * 20000);
      const taxAmount = subTotal * 0.15;
      const payableTotal = subTotal + taxAmount;

      const zatcaQr = zatcaService.generateZatcaQrCode({
        sellerName: merchant.shopName,
        vatNumber: merchant.taxNumber,
        timestamp: invDate.toISOString(),
        totalAmount: payableTotal,
        vatAmount: taxAmount
      });

      await Invoice.create({
        invoiceId: `KSA-INV-2025-${invNumberSeq}`,
        customer: selCust._id,
        subTotal,
        itemTax: taxAmount,
        payableTotal,
        paidAmount: payableTotal,
        dueAmount: 0,
        paidAmountCash: Math.floor(payableTotal * 0.3),
        paidAmountCard: Math.ceil(payableTotal * 0.7),
        createdBy: adminUser._id,
        status: 'final',
        zatcaQrCode: zatcaQr,
        createdAt: invDate,
        items: [
          { product: prod1._id, productName: prod1.name, quantity: 1, price: subTotal * 0.6, tax: taxAmount * 0.6, totalPrice: subTotal * 0.6 * 1.15 },
          { product: prod2._id, productName: prod2.name, quantity: 10, price: subTotal * 0.4, tax: taxAmount * 0.4, totalPrice: subTotal * 0.4 * 1.15 }
        ]
      });
    }

    console.log('✅ 50+ Historical ZATCA Phase 2 Invoices created over 1-Year (365 days) timeline.');

    // 8. 40+ POS SHIFTS ACROSS 1 YEAR
    for (let s = 350; s >= 0; s -= 9) {
      await PosShift.create({
        shiftNumber: `SHIFT-2025-DAY-${365 - s}`,
        cashier: cashierUser._id,
        openingFloat: 500,
        cashSales: 8500 + s * 15,
        cardSales: 19500 + s * 30,
        expectedCash: 9000 + s * 15,
        actualCash: 9000 + s * 15,
        variance: 0,
        status: 'CLOSED',
        openedAt: daysAgo(s + 0.4),
        closedAt: daysAgo(s)
      });
    }

    // 9. 15+ QUOTATIONS / ESTIMATES ACROSS 1 YEAR
    for (let q = 330; q >= 10; q -= 25) {
      await Quotation.create({
        quotationNumber: `EST-2025-00${Math.floor((365 - q) / 20)}`,
        customer: customersList[q % customersList.length]._id,
        items: [{ product: prod1._id, productName: prod1.name, quantity: 4, unitPrice: 12500, totalPrice: 50000 }],
        subTotal: 50000,
        taxAmount: 7500,
        grandTotal: 57500,
        status: 'SENT',
        createdBy: adminUser._id,
        createdAt: daysAgo(q)
      });
    }

    // 10. 15+ SERVICE BOOKINGS ACROSS 1 YEAR
    for (let b = 320; b >= 5; b -= 22) {
      await Booking.create({
        bookingCode: `BKG-KSA-${1000 + b}`,
        customer: customersList[b % customersList.length]._id,
        serviceTitle: 'On-Site High Voltage Switchgear Commissioning',
        bookingDate: daysAgo(b),
        timeSlot: '09:00 AM - 02:00 PM',
        price: 4500,
        status: 'COMPLETED',
        createdAt: daysAgo(b)
      });
    }

    // 11. 30+ CLIENT ATTENDANCE LOGS
    for (let ca = 300; ca >= 0; ca -= 10) {
      await ClientAttendance.create({
        customer: customersList[ca % customersList.length]._id,
        checkInTime: daysAgo(ca),
        membershipType: 'VIP Corporate License',
        gateLocation: 'Olaya Corporate Center Executive Suite Gate 1',
        createdAt: daysAgo(ca)
      });
    }

    // 12. 20+ LOYALTY POINTS TRANSACTIONS
    for (let pt = 340; pt >= 10; pt -= 18) {
      await PointCredit.create({
        customer: custAramco._id,
        pointsEarned: 1200,
        pointsRedeemed: 200,
        currentBalance: 1000 + (365 - pt) * 10,
        transactionType: 'EARN',
        referenceInvoice: `KSA-INV-2025-${1000 + Math.floor(pt / 7)}`,
        notes: 'Annual Corporate Loyalty Point Grant',
        createdAt: daysAgo(pt)
      });
    }

    // 13. CHART OF ACCOUNTS & 25+ POSTED JOURNAL VOUCHERS
    const acc10010 = await Account.create({ code: '10010', name: 'Cash Vault (Riyadh Bank - خزينة الرياض)', accountType: 'ASSET', balance: 185000 });
    const acc10020 = await Account.create({ code: '10020', name: 'Al Rajhi Corporate Bank Account (حساب الراجحي)', accountType: 'ASSET', balance: 1450000 });
    const acc10030 = await Account.create({ code: '10030', name: 'Accounts Receivable - Trade Debtors (ذمم مدينين)', accountType: 'ASSET', balance: 45000 });
    const acc20010 = await Account.create({ code: '20010', name: 'Accounts Payable - Trade Creditors (ذمم دائنين)', accountType: 'LIABILITY', balance: 120000 });
    const acc20020 = await Account.create({ code: '20020', name: 'ZATCA VAT Output Payable 15% (ضريبة القيمة المضافة)', accountType: 'LIABILITY', balance: 34500 });
    const acc40010 = await Account.create({ code: '40010', name: 'Commercial Sales Revenue (إيرادات المبيعات)', accountType: 'INCOME', balance: 890000 });
    const acc50010 = await Account.create({ code: '50010', name: 'Cost of Goods Sold - COGS (تكلفة البضاعة المباعة)', accountType: 'EXPENSE', balance: 480000 });
    const acc50020 = await Account.create({ code: '50020', name: 'Staff Wages & WPS Payroll Expense (رواتب الموظفين)', accountType: 'EXPENSE', balance: 145000 });

    for (let jv = 350; jv >= 10; jv -= 14) {
      await JournalVoucher.create({
        voucherNo: `JV-2025-00${Math.floor((365 - jv) / 14)}`,
        voucherDate: daysAgo(jv),
        description: `Bi-Weekly Corporate Utility & Operational Settlement (Period ${Math.floor((365 - jv) / 14) + 1})`,
        totalDebit: 8500,
        totalCredit: 8500,
        status: 'POSTED',
        createdBy: adminUser._id,
        createdAt: daysAgo(jv),
        entries: [
          { accountId: acc50020._id, accountName: acc50020.name, debit: 8500, credit: 0, memo: 'Bi-Weekly Payroll Outflow' },
          { accountId: acc10020._id, accountName: acc10020.name, debit: 0, credit: 8500, memo: 'Transferred via Al Rajhi Corporate' }
        ]
      });
    }

    // 14. 15+ CHEQUES ACROSS 1 YEAR
    for (let chk = 340; chk >= 10; chk -= 24) {
      await Cheque.create({
        chequeNumber: `CHK-KSA-${90000 + chk}`,
        chequeType: chk % 2 === 0 ? 'RECEIVED' : 'ISSUED',
        partyName: chk % 2 === 0 ? 'Saudi Aramco Overseas' : 'Caterpillar Middle East',
        bankName: 'National Commercial Bank (NCB الأهلي)',
        amount: 35000 + chk * 50,
        dueDate: daysAgo(chk),
        status: 'CLEARED',
        createdAt: daysAgo(chk)
      });
    }

    // 15. EMPLOYEES & 12 MONTHLY PAYROLL RUNS (1 YEAR)
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

    const monthsList = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
    for (const mStr of monthsList) {
      await Payslip.create({
        payslipNo: `PAY-${mStr.replace('-', '')}-EMP0101`,
        employee: emp1._id,
        month: mStr,
        basicSalary: 5500,
        totalAllowances: 2000,
        overtimePay: 450,
        netSalary: 7950,
        paymentStatus: 'PAID',
        wpsExported: true
      });
    }

    // 16. BOM & 15+ MANUFACTURING ORDERS ACROSS 1 YEAR
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

    for (let mo = 330; mo >= 0; mo -= 22) {
      await ManufacturingOrder.create({
        moNumber: `MO-2025-00${Math.floor((365 - mo) / 20)}`,
        bom: bom1._id,
        finishedGood: prod5._id,
        plannedQuantity: 10,
        producedQuantity: 10,
        targetWarehouse: whRuh._id,
        status: 'COMPLETED',
        createdAt: daysAgo(mo)
      });
    }

    // 17. PROJECTS & 25+ KANBAN TASKS
    const proj1 = await Project.create({
      projectCode: 'PRJ-NEOM-01',
      name: 'Neom Substation Electrical Equipment Installation (مشروع نيوم)',
      customer: custAramco._id,
      budget: 1850000,
      status: 'IN_PROGRESS'
    });

    const proj2 = await Project.create({
      projectCode: 'PRJ-REDSEA-02',
      name: 'Red Sea Resort Luxury Infrastructure Setup (مشروع البحر الأحمر)',
      customer: custRedSea._id,
      budget: 2400000,
      status: 'IN_PROGRESS'
    });

    for (let t = 1; t <= 12; t++) {
      await Task.create({
        taskNumber: `TSK-00${100 + t}`,
        project: t % 2 === 0 ? proj1._id : proj2._id,
        title: `Phase ${t} Commissioning & Safety Audit`,
        priority: t % 3 === 0 ? 'URGENT' : 'HIGH',
        status: t % 4 === 0 ? 'DONE' : (t % 3 === 0 ? 'IN_PROGRESS' : 'TODO'),
        assignee: adminUser._id
      });
    }

    // 18. RENTAL METERS (12 MONTHS)
    for (let rm = 12; rm >= 1; rm--) {
      await RentalMeter.create({
        meterNo: `MTR-OLAYA-40${rm}`,
        tenant: custSabic._id,
        previousReading: 10000 + (12 - rm) * 500,
        currentReading: 10500 + (12 - rm) * 500,
        ratePerUnit: 0.85,
        billedAmount: 425.00,
        status: 'BILLED'
      });
    }

    // 19. AUTO SEQUENCES, TAX EXEMPTIONS & CURRENCIES
    await AutoSequence.create({ docType: 'INVOICE', prefix: 'KSA-INV', nextNumber: 1050, zeroPad: 5 });
    await AutoSequence.create({ docType: 'ESTIMATE', prefix: 'KSA-EST', nextNumber: 25, zeroPad: 5 });
    await AutoSequence.create({ docType: 'PO', prefix: 'KSA-PO', nextNumber: 48, zeroPad: 5 });
    await AutoSequence.create({ docType: 'JV', prefix: 'KSA-JV', nextNumber: 35, zeroPad: 5 });

    await CurrencyRate.create({ currencyCode: 'SAR', currencyName: 'Saudi Riyal (ريال سعودي)', symbol: 'SAR', exchangeRate: 1.0, isDefault: true });

    await ApiKey.create({
      keyName: 'Shopify / WooCommerce Saudi Portal Connector',
      keySecret: 'sec_live_saudi_enterprise_99887766554433221100',
      permissions: ['read:products', 'write:invoices'],
      rateLimitPerMin: 100,
      status: 'ACTIVE'
    });

    console.log('🎉 1-YEAR MASSIVE Saudi Arabia Enterprise Data Seeder Execution Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
