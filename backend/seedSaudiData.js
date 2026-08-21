const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Supplier = require('./models/Supplier');
const Tax = require('./models/Tax');
const Invoice = require('./models/Invoice');
const Purchase = require('./models/Purchase');
const Merchant = require('./models/Merchant');
const User = require('./models/User');

const seedSaudiData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas (ksapos)...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    // 1. Fetch or create default Merchant
    let merchant = await Merchant.findOne({ email: 'rony165547@gmail.com' });
    if (!merchant) {
      merchant = await Merchant.findOne({});
    }

    if (!merchant) {
      merchant = await Merchant.create({
        shopName: 'Al-Madina Electronics & Auto Trading (المتجر السعودي للأجهزة والقطع)',
        ownerName: 'Sheikh Mohammad Al-Otaibi',
        email: 'rony165547@gmail.com',
        phone: '+966 50 123 4567',
        address: 'King Fahd Road, Olaya District',
        city: 'Riyadh (الرياض)',
        country: 'Saudi Arabia (المملكة العربية السعودية)',
        subscriptionStatus: 'active'
      });
      console.log('Created Saudi Merchant Store:', merchant.shopName);
    } else {
      merchant.shopName = 'Al-Madina Electronics & Moto POS (المتجر السعودي للأجهزة والقطع)';
      merchant.city = 'Riyadh (الرياض)';
      merchant.country = 'Saudi Arabia';
      await merchant.save();
      console.log('Updated Merchant Store:', merchant.shopName);
    }

    const merchantId = merchant._id;

    // Fetch user for invoice creation
    let user = await User.findOne({ merchant: merchantId });
    if (!user) {
      user = await User.findOne({});
    }

    // 2. Clear old data for clean re-seeding
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Tax.deleteMany({});
    await Invoice.deleteMany({});
    await Purchase.deleteMany({});

    console.log('Cleared existing database collections for fresh Saudi seeding.');

    // 3. Seed Saudi Taxes (ZATCA 15% VAT)
    const vat15 = await Tax.create({
      merchant: merchantId,
      taxLabel: 'Saudi ZATCA VAT 15% (ضريبة القيمة المضافة)',
      taxPercentage: 15
    });

    const vat0 = await Tax.create({
      merchant: merchantId,
      taxLabel: 'Zero-Rated VAT 0%',
      taxPercentage: 0
    });

    console.log('Created Saudi ZATCA Tax Rates (15% VAT).');

    // 4. Seed Saudi Categories
    const categoriesData = [
      { name: 'Smartphones & Mobile Devices (الهواتف الذكية)' },
      { name: 'Computers & Gaming Laptops (أجهزة الكمبيوتر واللابتوب)' },
      { name: 'Home & Kitchen Appliances (الأجهزة المنزلية)' },
      { name: 'Motorcycle & Vehicle Parts (قطع غيار السيارات والدراجات)' },
      { name: 'Audio & Premium Sound Systems (أجهزة الصوتيات)' },
      { name: 'Cameras & Drones (الكاميرات والطائرات المسيرة)' },
      { name: 'Power Tools & Electrical (الأدوات الكهربائية والصناعية)' },
      { name: 'Smart Watches & Accessories (الساعات الذكية والإكسسوارات)' }
    ];

    const categoryDocs = [];
    for (const cat of categoriesData) {
      const doc = await Category.create({ name: cat.name, merchant: merchantId });
      categoryDocs.push(doc);
    }
    console.log(`Created ${categoryDocs.length} Product Categories.`);

    const catMap = {};
    categoryDocs.forEach(c => { catMap[c.name] = c._id; });

    // 5. Seed Saudi Suppliers
    const suppliersData = [
      {
        merchant: merchantId,
        name: 'Jarir Marketing Company (شركة جرير للتسويق)',
        code: 'SUP-KSA-001',
        phone: '+966 11 462 6000',
        email: 'b2b.sales@jarir.com',
        address: 'King Fahd Branch Road, Olaya',
        city: 'Riyadh (الرياض)',
        country: 'Saudi Arabia',
        taxNumber: '300123456700003'
      },
      {
        merchant: merchantId,
        name: 'eXtra Stores Saudi Arabia (الشركة المتحدة للإلكترونيات)',
        code: 'SUP-KSA-002',
        phone: '+966 12 690 9999',
        email: 'corporate@extra.com.sa',
        address: 'Sari Street, Al-Bawadi',
        city: 'Jeddah (جدة)',
        country: 'Saudi Arabia',
        taxNumber: '310987654300003'
      },
      {
        merchant: merchantId,
        name: 'Abdul Latif Jameel Auto Parts (عبد اللطيف جميل لقطع الغيار)',
        code: 'SUP-KSA-003',
        phone: '+966 12 608 6000',
        email: 'parts.inquiry@alj.com.sa',
        address: 'Palestine Street, Al-Hamra',
        city: 'Jeddah (جدة)',
        country: 'Saudi Arabia',
        taxNumber: '300998877600003'
      },
      {
        merchant: merchantId,
        name: 'Al-Babtain Trading Co. (شركة البابطين للتجارة والاستيراد)',
        code: 'SUP-KSA-004',
        phone: '+966 13 833 4455',
        email: 'info@albabtain.com.sa',
        address: 'King Abdulaziz Street',
        city: 'Dammam (الدمام)',
        country: 'Saudi Arabia',
        taxNumber: '300554433200003'
      },
      {
        merchant: merchantId,
        name: 'Al-Futtaim Saudi Motors & Electronics (شركة الفطيم السعودية)',
        code: 'SUP-KSA-005',
        phone: '+966 11 289 7777',
        email: 'supply@alfuttaim.com.sa',
        address: 'Khobar Highway',
        city: 'Khobar (الخبر)',
        country: 'Saudi Arabia',
        taxNumber: '300443322100003'
      }
    ];

    const supplierDocs = await Supplier.insertMany(suppliersData);
    console.log(`Created ${supplierDocs.length} Saudi Suppliers.`);

    // 6. Seed Saudi Customers
    const customersData = [
      {
        merchant: merchantId,
        name: 'Sheikh Mohammad Al-Otaibi (الشيخ محمد العتيبي)',
        code: 'CUST-SA-101',
        phone: '+966 50 111 2233',
        email: 'm.otaibi@saudi.sa',
        address: 'Villa 14, Al-Malqa District',
        city: 'Riyadh (الرياض)',
        country: 'Saudi Arabia',
        taxNumber: '310112233400003',
        Uakam_no: '1089475612'
      },
      {
        merchant: merchantId,
        name: 'Tariq Abdulaziz Al-Ghamdi (طارق عبد العزيز الغامدي)',
        code: 'CUST-SA-102',
        phone: '+966 55 444 5566',
        email: 'tariq.ghamdi@gmail.com',
        address: 'Corniche Road, Al-Shati',
        city: 'Jeddah (جدة)',
        country: 'Saudi Arabia',
        taxNumber: '310445566700003',
        Uakam_no: '2109847365'
      },
      {
        merchant: merchantId,
        name: 'Sultan Fahad Al-Qahtani (سلطان فهد القحطاني)',
        code: 'CUST-SA-103',
        phone: '+966 56 777 8899',
        email: 'sultan.qahtani@yahoo.com',
        address: 'Prince Mohammad Street',
        city: 'Dammam (الدمام)',
        country: 'Saudi Arabia',
        taxNumber: '310778899000003',
        Uakam_no: '2456789123'
      },
      {
        merchant: merchantId,
        name: 'Abdullah Omar Al-Zahrani (عبد الله عمر الزهراني)',
        code: 'CUST-SA-104',
        phone: '+966 54 333 2211',
        email: 'a.zahrani@hotmail.com',
        address: 'Al-Aziziyah Main Street',
        city: 'Makkah (مكة المكرمة)',
        country: 'Saudi Arabia',
        taxNumber: '310332211400003',
        Uakam_no: '2234567891'
      },
      {
        merchant: merchantId,
        name: 'Faisal Khaled Al-Dosari (فيصل خالد الدوسري)',
        code: 'CUST-SA-105',
        phone: '+966 53 999 8877',
        email: 'f.dosari@company.sa',
        address: 'Golden Belt District',
        city: 'Khobar (الخبر)',
        country: 'Saudi Arabia',
        taxNumber: '310998877500003',
        Uakam_no: '2198765432'
      },
      {
        merchant: merchantId,
        name: 'Eng. Yousef Ahmad Al-Ezi (المهندس يوسف أحمد العزي)',
        code: 'CUST-SA-106',
        phone: '+966 59 123 9876',
        email: 'yousef.elezi@engineer.sa',
        address: 'Diplomatic Quarter',
        city: 'Riyadh (الرياض)',
        country: 'Saudi Arabia',
        taxNumber: '310123987600003',
        Uakam_no: '2412345678'
      }
    ];

    const customerDocs = await Customer.insertMany(customersData);
    console.log(`Created ${customerDocs.length} Saudi Customers with Iqama & VAT IDs.`);

    // 7. Seed Thousands of SAR High-Value Electronics & Auto Products
    const productsData = [
      // Smartphones
      {
        merchant: merchantId,
        name: 'iPhone 15 Pro Max 256GB Natural Titanium (آيفون 15 بروماكس)',
        sku: 'IPH-15PM-256-NAT',
        category: catMap['Smartphones & Mobile Devices (الهواتف الذكية)'],
        description: 'Apple A17 Pro Chip, 48MP Main Camera, Titanium Design, USB-C',
        purchasePrice: 4350,
        salePrice: 4999,
        quantityInStock: 45,
        unit: 'pcs',
        tax: 15,
        code: '5001',
        barcode: '195949021234'
      },
      {
        merchant: merchantId,
        name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black (سامسونج اس 24 اولترا)',
        sku: 'SAM-S24U-512-BLK',
        category: catMap['Smartphones & Mobile Devices (الهواتف الذكية)'],
        description: 'Galaxy AI Enabled, Snapdragon 8 Gen 3, 200MP Camera with S-Pen',
        purchasePrice: 4650,
        salePrice: 5399,
        quantityInStock: 30,
        unit: 'pcs',
        tax: 15,
        code: '5002',
        barcode: '880609512345'
      },
      {
        merchant: merchantId,
        name: 'Honor Magic 6 Pro 512GB Epi Green (هونر ماجيك 6 برو)',
        sku: 'HNR-M6P-512-GRN',
        category: catMap['Smartphones & Mobile Devices (الهواتف الذكية)'],
        description: '180MP Periscope Telephoto Camera, 5600mAh Battery, 80W Fast Charge',
        purchasePrice: 3200,
        salePrice: 3899,
        quantityInStock: 25,
        unit: 'pcs',
        tax: 15,
        code: '5003',
        barcode: '690144312345'
      },

      // Laptops & Computers
      {
        merchant: merchantId,
        name: 'Apple MacBook Pro 16" M3 Max 36GB RAM 1TB SSD Space Black',
        sku: 'MAC-16-M3MAX-36-1TB',
        category: catMap['Computers & Gaming Laptops (أجهزة الكمبيوتر واللابتوب)'],
        description: 'M3 Max 16-Core CPU, 40-Core GPU, Liquid Retina XDR Display',
        purchasePrice: 12500,
        salePrice: 14299,
        quantityInStock: 12,
        unit: 'pcs',
        tax: 15,
        code: '6001',
        barcode: '195949987654'
      },
      {
        merchant: merchantId,
        name: 'ASUS ROG Strix SCAR 18 Gaming Laptop RTX 4090 32GB RAM',
        sku: 'ASUS-ROG-18-4090',
        category: catMap['Computers & Gaming Laptops (أجهزة الكمبيوتر واللابتوب)'],
        description: 'Intel i9 14900HX, NVIDIA RTX 4090 16GB, 240Hz Nebula HDR Display',
        purchasePrice: 13800,
        salePrice: 15899,
        quantityInStock: 8,
        unit: 'pcs',
        tax: 15,
        code: '6002',
        barcode: '471108198765'
      },
      {
        merchant: merchantId,
        name: 'Lenovo Legion Pro 7i Core i9 16GB RTX 4080 1TB SSD',
        sku: 'LEN-LEGION-P7I-4080',
        category: catMap['Computers & Gaming Laptops (أجهزة الكمبيوتر واللابتوب)'],
        description: 'PureSight Gaming Display 240Hz, AI Engine+, Legion Coldfront 5.0 Cooling',
        purchasePrice: 8900,
        salePrice: 10499,
        quantityInStock: 15,
        unit: 'pcs',
        tax: 15,
        code: '6003',
        barcode: '195892123456'
      },

      // Home Appliances
      {
        merchant: merchantId,
        name: 'LG OLED 65" 4K Smart TV G3 Series OLED65G36LA (تلفزيون ال جي اوليد)',
        sku: 'LG-OLED-65G3',
        category: catMap['Home & Kitchen Appliances (الأجهزة المنزلية)'],
        description: 'Brightness Booster Max, webOS 23, Dolby Vision & Atmos, 120Hz Gaming',
        purchasePrice: 5600,
        salePrice: 6499,
        quantityInStock: 20,
        unit: 'unit',
        tax: 15,
        code: '7001',
        barcode: '880609123999'
      },
      {
        merchant: merchantId,
        name: 'Dyson V15 Detect Absolute Cordless Vacuum Cleaner (مكنسة دايسون)',
        sku: 'DYS-V15-ABS',
        category: catMap['Home & Kitchen Appliances (الأجهزة المنزلية)'],
        description: 'Laser Reveals Invisible Dust, Piezo Sensor Acoustic Particle Count',
        purchasePrice: 2550,
        salePrice: 2999,
        quantityInStock: 35,
        unit: 'unit',
        tax: 15,
        code: '7002',
        barcode: '502515566778'
      },
      {
        merchant: merchantId,
        name: 'Nespresso Vertuo Next Coffee Machine Black Chrome (صانعة القهوة نيسبريسو)',
        sku: 'NES-VERTUO-NEXT',
        category: catMap['Home & Kitchen Appliances (الأجهزة المنزلية)'],
        description: 'Centrifusion Extraction Technology, 5 Cup Sizes, Wi-Fi & Bluetooth',
        purchasePrice: 680,
        salePrice: 849,
        quantityInStock: 50,
        unit: 'unit',
        tax: 15,
        code: '7003',
        barcode: '761303698765'
      },

      // Motorcycle & Auto Parts
      {
        merchant: merchantId,
        name: 'Yamalube 4T 10W-40 Full Synthetic Engine Oil 1 Litre (زيت يامالووب دبابات)',
        sku: 'YAM-OIL-4T-10W40',
        category: catMap['Motorcycle & Vehicle Parts (قطع غيار السيارات والدراجات)'],
        description: 'Genuine Yamaha Motorcycle Engine Oil for High RPM Performance',
        purchasePrice: 32,
        salePrice: 48,
        quantityInStock: 300,
        unit: 'bottle',
        tax: 15,
        code: '8001',
        barcode: '490528412345'
      },
      {
        merchant: merchantId,
        name: 'Akrapovic Titanium Racing Slip-On Exhaust CBR600RR (شكمان أكرابوفيك تيتانيوم)',
        sku: 'AKRA-TIT-CBR600',
        category: catMap['Motorcycle & Vehicle Parts (قطع غيار السيارات والدراجات)'],
        description: 'Ultra Lightweight Titanium Exhaust Muffler System for Superbike Performance',
        purchasePrice: 3600,
        salePrice: 4299,
        quantityInStock: 10,
        unit: 'set',
        tax: 15,
        code: '8002',
        barcode: '383111223344'
      },
      {
        merchant: merchantId,
        name: 'Brembo Racing Front Brake Pads Set MonoBlock (فحمات بريمبو رياضية)',
        sku: 'BREMBO-PAD-RACING',
        category: catMap['Motorcycle & Vehicle Parts (قطع غيار السيارات والدراجات)'],
        description: 'High Friction Sintered Metallic Compound for Heavy Duty Braking',
        purchasePrice: 180,
        salePrice: 249,
        quantityInStock: 120,
        unit: 'set',
        tax: 15,
        code: '8003',
        barcode: '802058412345'
      },
      {
        merchant: merchantId,
        name: 'Michelin Pilot Road 6 Motorcycle Rear Tire 180/55 ZR17 (كفرات ميشلان للدباب)',
        sku: 'MICH-PR6-180-55-17',
        category: catMap['Motorcycle & Vehicle Parts (قطع غيار السيارات والدراجات)'],
        description: '2CT+ Dual Compound Technology for Superior Wet & Dry Grip',
        purchasePrice: 620,
        salePrice: 799,
        quantityInStock: 80,
        unit: 'pcs',
        tax: 15,
        code: '8004',
        barcode: '352870123456'
      },

      // Audio & Gaming
      {
        merchant: merchantId,
        name: 'Sony PlayStation 5 Slim Digital Edition 1TB SSD (سوني بلايستيشن 5 سليم)',
        sku: 'SONY-PS5-SLIM-DIG',
        category: catMap['Audio & Premium Sound Systems (أجهزة الصوتيات)'],
        description: '1TB Custom High-Speed SSD, Tempest 3D AudioTech, DualSense Controller',
        purchasePrice: 1590,
        salePrice: 1849,
        quantityInStock: 60,
        unit: 'unit',
        tax: 15,
        code: '9001',
        barcode: '711719543210'
      },
      {
        merchant: merchantId,
        name: 'JBL PartyBox 310 Portable Bluetooth Party Speaker (سماعة جي بي ال)',
        sku: 'JBL-PARTYBOX-310',
        category: catMap['Audio & Premium Sound Systems (أجهزة الصوتيات)'],
        description: '240W Powerful Sound, Dynamic Light Show, IPX4 Splashproof, 18H Playtime',
        purchasePrice: 1650,
        salePrice: 1999,
        quantityInStock: 28,
        unit: 'unit',
        tax: 15,
        code: '9002',
        barcode: '692528123456'
      },
      {
        merchant: merchantId,
        name: 'Apple AirPods Pro 2nd Gen USB-C Active Noise Cancellation (سماعات ايربودز برو)',
        sku: 'APP-PRO2-USBC',
        category: catMap['Audio & Premium Sound Systems (أجهزة الصوتيات)'],
        description: 'H2 Chip, Adaptive Audio, Conversation Awareness, MagSafe Case',
        purchasePrice: 760,
        salePrice: 899,
        quantityInStock: 100,
        unit: 'pcs',
        tax: 15,
        code: '9003',
        barcode: '195949555666'
      },

      // Power Tools
      {
        merchant: merchantId,
        name: 'Bosch Professional Cordless Hammer Drill GSB 18V-50 (دريل بوش احترافي 18 فولت)',
        sku: 'BOSCH-GSB-18V50',
        category: catMap['Power Tools & Electrical (الأدوات الكهربائية والصناعية)'],
        description: 'Brushless Motor, 50Nm Torque, Metal Chuck, 2x 2.0Ah Batteries & Case',
        purchasePrice: 590,
        salePrice: 749,
        quantityInStock: 40,
        unit: 'set',
        tax: 15,
        code: '1001',
        barcode: '316514098765'
      }
    ];

    const productDocs = await Product.insertMany(productsData);
    console.log(`Created ${productDocs.length} Saudi High-Value Products.`);

    // 8. Seed Realistic Saudi Sales Invoices (ZATCA SAR Currency)
    if (user) {
      const invoicesData = [
        {
          merchant: merchantId,
          invoiceId: 'INV-KSA-2026-001',
          customer: customerDocs[0]._id,
          invoiceDate: new Date('2026-08-10'),
          subTotal: 10398,
          itemDiscount: 200,
          itemTax: 1529.70,
          cartDiscount: 100,
          payableTotal: 11627.70,
          paidAmount: 11627.70,
          paidAmountCash: 11627.70,
          dueAmount: 0,
          createdBy: user._id,
          items: [
            {
              product: productDocs[0]._id,
              productName: productDocs[0].name,
              quantity: 2,
              price: productDocs[0].salePrice,
              tax: 15,
              discount: 100,
              totalPrice: 9898
            }
          ]
        },
        {
          merchant: merchantId,
          invoiceId: 'INV-KSA-2026-002',
          customer: customerDocs[1]._id,
          invoiceDate: new Date('2026-08-12'),
          subTotal: 14299,
          itemDiscount: 500,
          itemTax: 2069.85,
          cartDiscount: 0,
          payableTotal: 15868.85,
          paidAmount: 15868.85,
          paidAmountCard: 15868.85,
          dueAmount: 0,
          createdBy: user._id,
          items: [
            {
              product: productDocs[3]._id,
              productName: productDocs[3].name,
              quantity: 1,
              price: productDocs[3].salePrice,
              tax: 15,
              discount: 500,
              totalPrice: 13799
            }
          ]
        },
        {
          merchant: merchantId,
          invoiceId: 'INV-KSA-2026-003',
          customer: customerDocs[2]._id,
          invoiceDate: new Date('2026-08-15'),
          subTotal: 5047,
          itemDiscount: 100,
          itemTax: 742.05,
          cartDiscount: 50,
          payableTotal: 5639.05,
          paidAmount: 3000,
          paidAmountBank: 3000,
          dueAmount: 2639.05,
          createdBy: user._id,
          items: [
            {
              product: productDocs[1]._id,
              productName: productDocs[1].name,
              quantity: 1,
              price: productDocs[1].salePrice,
              tax: 15,
              discount: 100,
              totalPrice: 5299
            }
          ]
        }
      ];

      await Invoice.insertMany(invoicesData);
      console.log(`Created ${invoicesData.length} Saudi POS Sales Invoices.`);
    }

    console.log('🎉 SAUDI ARABIA DUMMY DATA SEEDING COMPLETE! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Saudi dummy data:', error);
    process.exit(1);
  }
};

seedSaudiData();
