# 📦 Inventory System Architecture & Functional Specification
## (ইনভেন্টরি ও ওয়্যারহাউস মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 🏪 MANAGE WAREHOUSES & LOCATIONS (ওয়্যারহাউস ব্যবস্থাপনা)

### 1.1 Multi-Store Hierarchy Setup
* **1.1.1 Multi-Location Structure:** প্রধান গুদাম, শাখা গুদাম, এবং র্যাক/বিন (Bin/Rack Location) ট্রি স্ট্রাকচার।
* **1.1.2 Default Warehouse Mapping:** শাখা বা পিওএস টার্মিনালের জন্য ডিফল্ট গুদাম নির্ধারণ।

### 1.2 Inter-Warehouse Stock Transfer
* **1.2.1 Transfer Order Workflow:** 
  * **Step 1 - Order:** সোর্স গুদাম থেকে গন্তব্য গুদামে প্রোডাক্ট স্থানান্তরের চালান তৈরি করা।
  * **Step 2 - Dispatch:** সোর্স গুদাম থেকে পণ্য স্টক বিয়োগ হওয়া এবং স্ট্যাটাস `IN_TRANSIT` রাখা।
  * **Step 3 - Receive:** গন্তব্য গুদামে গ্রহণকারী স্টক মিলিয়ে কনফার্ম করলে ইন-ট্রানজিট থেকে স্টকে যুক্ত হওয়া।

---

## 2. 📋 MANAGE STOCKTAKINGS & AUDITS (স্টক অডিট ও গণনা)

### 2.1 Physical vs System Count Variance Matrix
* **2.1.1 Physical Audit Entry:** বারকোড স্ক্যানার বা কাস্টম কাউন্টিং অ্যাপ দিয়ে শারীরিকভাবে স্টক গুনে সিস্টেমে ইনপুট দেওয়া।
* **2.1.2 Discrepancy Formula:**
  $$\text{Stock Variance} = \text{Physical Count} - \text{System Stock}$$

### 2.2 Automated Stock Adjustment Vouchers
* **2.2.1 Stock Gain ($\text{Variance} > 0$):** শারীরিকভাবে বেশি পাওয়া গেলে স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে যুক্ত করা এবং অ্যাকাউন্টিং জার্নাল এন্ট্রি করা:
  * `Debit: Inventory Account`
  * `Credit: Stock Adjustment Gain Account`
* **2.2.2 Stock Loss ($\text{Variance} < 0$):** কম পাওয়া গেলে ইনভেন্টরি থেকে বিয়োগ করা:
  * `Debit: Stock Adjustment Loss Account`
  * `Credit: Inventory Account`

---

## 3. 📦 PRODUCTS & SERVICES MASTER (পণ্য ও সেবা তৈরি)

### 3.1 Category Taxonomy & Pricing
* **3.1.1 Categorization:** ক্যাটাগরি, সাব-ক্যাটাগরি, ব্র্যান্ড এবং মেজারমেন্ট ইউনিট (UOM) ম্যাপিং।
* **3.1.2 Pricing & Tax Rules:** ডিফল্ট সেলস প্রাইস, পারচেজ প্রাইস, প্রফিট মার্জিন % এবং ভ্যাট ট্যাক্স রুলস সিলেক্ট করা।

### 3.2 Opening Stock & Import Engine
* **3.2.1 Opening Stock Entry:** নতুন প্রোডাক্ট যোগ করার সময় প্রাথমিক মজুদের পরিমাণ এবং আইটেম প্রতি দাম এন্ট্রি দেওয়া।
* **3.2.2 Bulk Import Template:** এক্সেল বা সিএসভি ফেমপ্লেট দিয়ে একবারে হাজার হাজার প্রোডাক্ট স্টকসহ ইমপোর্ট করা।

---

## 4. 🏷️ PRICE LISTS & TIERED PRICING (মূল্য তালিকা)

### 4.1 Custom Price List Builder
* **4.1.1 Tier Pricing Engine:** খুচরা (Retail), পাইকারি (Wholesale), ডিস্ট্রিবিউটর বা কর্পোরেট কাস্টমারদের জন্য আলাদা আলাদা প্রাইস তৈরি করা।
* **4.1.2 Date-Bound Promotions:** নির্দিষ্ট দিন বা মেয়াদের জন্য বিশেষ ছাড়ের তালিকা সেটআপ।

### 4.2 Group & Client Assignment Engine
* **4.2.1 Automated Application:** নির্দিষ্ট প্রাইস লিস্টটি নির্দিষ্ট কাস্টমার গ্রুপ বা নির্দিষ্ট কাস্টমারের সাথে ট্যাগ করা (POS সেলস চালানে অটো রেট বসবে)।

---

## 5. 📏 UNIT TEMPLATES & CONVERSIONS (একক রূপান্তর)

### 5.1 Primary Unit Setup
* **5.1.1 Base Unit Definition:** পণ্যের সর্বনিম্ন বিক্রয়যোগ্য একক নির্ধারণ (যেমন: Pcs, Kg, Meter, Box)।

### 5.2 Conversion Engine & Multiplier Rules
* **5.2.1 Sub-Unit Multipliers:**
  * Base Unit: `Pcs`
  * Sub-Unit: `Box = 10 Pcs`, `Carton = 12 Boxes (120 Pcs)`
* **5.2.2 Automated Deduction:** চালানে যদি "১ কার্টন" সিলেক্ট করা হয়, স্টক লেজার থেকে স্বয়ংক্রিয়ভাবে মূল একক হিসেবে ১২০ Pcs কমবে।

---

## 6. 🎁 BUNDLE PRODUCTS (কম্বো প্যাক)

### 6.1 Bundle Definition & Pricing
* **6.1.1 Kit Assembly:** একাধিক পণ্য একত্রে একটি বান্ডিল প্রোডাক্ট (যেমন: "School Gift Set") হিসেবে তৈরি ও নির্দিষ্ট মূল্য নির্ধারণ।

### 6.2 Component Stock Deduction Logic
* **6.2.1 Component Consumption:** বান্ডিল বিক্রি হলে বান্ডিলের অন্তর্গত প্রতিটি মূল আইটেমের নিজস্ব স্টক বিয়োগ হবে।
* **6.2.2 Weakest Link Availability Formula:** বান্ডিল কতটি বিক্রি করা সম্ভব তা নির্ভর করবে সবচেয়ে কম স্টকে থাকা উপাদানের ওপর:
  $$\text{Max Available Bundles} = \min_{i} \left( \left\lfloor \frac{\text{Stock}_i}{\text{Required Qty}_i} \right\rfloor \right)$$

---

## 7. 🏷️ PRODUCT TRACKING (সিরিয়াল, ব্যাচ ও এক্সপায়ারি)

### 7.1 Serial Number / IMEI Tracking
* **7.1.1 Enable Serial Tracking:** ইলেকট্রনিক্স বা দামি পণ্যের জন্য সিরিয়াল নম্বর বা IMEI ট্র্যাকিং চালু করা।
* **7.1.2 Specific Serial Billing:** ক্রয়ের সময় নির্দিষ্ট সিরিয়াল স্টকে যুক্ত করা এবং বিক্রয়ের সময় নির্দিষ্ট সিরিয়াল স্ক্যান করে নির্বাচন করা (ওয়ারেন্টি ট্র্যাকিং সহজ হবে)।

### 7.2 Batch & Expiry Date Management
* **7.2.1 Enable Batch Tracking:** খাদ্য, প্রসাধনী বা ফার্মাসিউটিক্যালস পণ্যের জন্য ব্যাচ নাম্বার ও মেয়াদের তারিখ চালু করা।
* **7.2.2 FEFO Engine (First Expired, First Out):** যে ব্যাচের মেয়াদের তারিখ আগে শেষ হবে, সিস্টেমে চালানের জন্য সেই ব্যাচটি স্বয়ংক্রিয়ভাবে আগে সিলেক্ট হবে।

---

## 8. 💾 MongoDB Schemas for Inventory System

```javascript
// models/InventorySystemModels.js
const mongoose = require('mongoose');

// 1. Warehouse Schema
const WarehouseSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  code: { type: String, unique: true },
  location: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// 2. Product Master Schema
const ProductSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  sku: { type: String, required: true, unique: true },
  barcode: String,
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  productType: { type: String, enum: ['STANDARD', 'SERVICE', 'BUNDLE'], default: 'STANDARD' },
  
  unit: { type: String, default: 'PCS' },
  subUnits: [{
    unitName: String,
    multiplier: Number
  }],
  
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  
  isSerialTracked: { type: Boolean, default: false },
  isBatchTracked: { type: Boolean, default: false },
  
  bundleComponents: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }]
}, { timestamps: true });

module.exports = {
  Warehouse: mongoose.model('Warehouse', WarehouseSchema),
  Product: mongoose.model('Product', ProductSchema)
};
```
