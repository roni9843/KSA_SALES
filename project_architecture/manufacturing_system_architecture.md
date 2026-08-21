# 🏭 Manufacturing System Architecture & Functional Specification
## (উৎপাদন ও প্রক্রিয়াজাতকরণ মডিউলের বিস্তারিত ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 📜 BILL OF MATERIALS - BOM (উৎপাদন রেসিপি)

### 1.1 Recipe Formulation & Quantity Ratios
* **1.1.1 Ingredient Breakdown:** ১ ইউনিট ফিনিশড প্রোডাক্ট (Finished Goods) তৈরি করতে প্রয়োজনীয় কাঁচামালের অনুপাত ও তালিকা।
* **1.1.2 Scrap & Wastage Factor:** উৎপাদনের সময় কাঁচামালের সম্ভাব্য অপচয় (Wastage %) হিসাব করা।

### 1.2 Overhead Cost & Direct Labor Allocation
* **1.2.1 Costing Breakdown Formula:**
  $$\text{Standard Unit Cost} = \sum (\text{Raw Material Qty}_i \times \text{Unit Cost}_i) + \text{Direct Labor Charge} + \text{Work Center Overhead}$$

---

## 2. 🏗️ MANUFACTURING ORDERS (উৎপাদন আদেশ)

### 2.1 Manufacturing Order Setup & Material Staging
* **2.1.1 Production Order Creation:** নির্দিষ্ট পরিমাণে ফিনিশড প্রোডাক্ট উৎপাদনের জন্য সময়সূচি নির্ধারণ ও ওয়ার্ক সেন্টার নির্বাচন।
* **2.1.2 Stage 1 - Raw Material Consumption (Staging):**
  * গুদাম থেকে কাঁচামাল প্রোডাকশন ফ্লোরে ইস্যু করা:
  * `Debit: Work-In-Progress (WIP) Account`
  * `Credit: Raw Material Inventory`

### 2.2 Production Process & Finished Goods Receipt
* **2.2.1 Stage 2 - WIP Assembly:** উৎপাদন প্রক্রিয়াধীন (Work-in-Progress) রাখা।
* **2.2.2 Stage 3 - Finished Goods Entry:** উৎপাদন শেষে উৎপাদিত মূল পণ্য ওয়্যারহাউস স্টকে জমা করা:
  * `Debit: Finished Goods Inventory`
  * `Credit: Work-In-Progress (WIP) Account`

---

## 3. ⚙️ WORK CENTERS SETUP (ওয়ার্ক সেন্টার সেটআপ)

### 3.1 Work Center Capacity & Hourly Rates
* **3.1.1 Machine & Labor Allocation:** কারখানা বা প্রোডাকশন লাইনের ওয়ার্ক সেন্টার তৈরি, দৈনিক কাজের ক্ষমতা (Hours) এবং প্রতি ঘণ্টার অপারেটিং রেট সেটআপ।

---

## 4. 💾 MongoDB Schemas for Manufacturing System

```javascript
// models/ManufacturingSystemModels.js
const mongoose = require('mongoose');

// 1. Bill of Materials (BOM) Schema
const BomSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  finishedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  bomCode: { type: String, required: true, unique: true },
  rawMaterials: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    wastagePercentage: { type: Number, default: 0 }
  }],
  directLaborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 }
}, { timestamps: true });

// 2. Manufacturing Order Schema
const ManufacturingOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  orderNumber: { type: String, required: true, unique: true },
  bomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bom', required: true },
  targetQuantity: { type: Number, required: true },
  status: { type: String, enum: ['PLANNED', 'STAGED', 'IN_PRODUCTION', 'COMPLETED'], default: 'PLANNED' },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = {
  Bom: mongoose.model('Bom', BomSchema),
  ManufacturingOrder: mongoose.model('ManufacturingOrder', ManufacturingOrderSchema)
};
```
