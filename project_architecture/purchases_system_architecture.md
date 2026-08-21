# 🛒 Purchases System Architecture & Functional Specification
## (পারচেজ ও সাপ্লায়ার মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 🏭 SUPPLIERS (সরবরাহকারী ব্যবস্থাপনা)

### 1.1 Supplier Registration & Profile Setup
* **1.1.1 Contact & Tax Info:** সাপ্লায়ারের নাম, বাণিজ্যিক নাম, কন্টাক্ট পারসন, ফোন, ইমেইল, ভ্যাট নাম্বার (`taxNumber`), এবং ট্রেড লাইসেন্স।
* **1.1.2 Opening Balance Setup:**
  * **Debit Balance (Overpaid / Advance):** সাপ্লায়ারের কাছে আমাদের পূর্বে জমাকৃত অ্যাডভান্স টাকা।
    * `Debit: Supplier Advance Payments (Asset)`
    * `Credit: Opening Balance Equity`
  * **Credit Balance (Our Outstanding Debt):** সাপ্লায়ারের কাছে আমাদের পূর্বে বকেয়া দেনা।
    * `Debit: Opening Balance Equity`
    * `Credit: Accounts Payable (Liability)`

### 1.2 Supplier Groups & Terms
* **1.2.1 Grouping Setup:** Local Suppliers, International Vendors, Raw Material Suppliers গ্রুপ তৈরি করা।
* **1.2.2 Payment Terms & Credit Limits:** ডিফল্ট ক্রেডিট মেয়াদ (যেমন: Net 30 Days) এবং সর্বোচ্চ বাকির সীমা নির্ধারণ।

### 1.3 Supplier Ledger & Account Statements
* **1.3.1 Real-Time Payable Ledger:** বকেয়া বিল, ভাউচার পেমেন্ট এবং ডেবিট নোটের সমন্বিত রিয়েল-টাইম হিসাব।
* **1.3.2 Account Statement Export:** নির্ধারিত তারিখ অনুযায়ী রসিদ, মোট ক্রয় এবং ব্যাংকিং স্টেটমেন্ট PDF জেনারেট ও ইমেইল পাঠানো।

---

## 2. 📄 PURCHASE REQUESTS & ORDERS (ক্রয় অনুরোধ ও আদেশ)

### 2.1 Purchase Request (PR) Workflow
* **2.1.1 Department Requisition:** কোনো ডিপার্টমেন্ট বা প্রজেক্ট থেকে প্রয়োজনীয় আইটেম ও পরিমাণের চাহিদাপত্র তৈরি করা।
* **2.1.2 Approval Chain:** ম্যানেজার অনুমোদন প্রদান করলে প্রস্তাবিত চাহিদাপত্রটি Purchase Order তৈরির যোগ্য হবে।

### 2.2 Purchase Order (PO) Management
* **2.2.1 PO Setup:** সাপ্লায়ার নির্বাচন, আনুমানিক ডেলিভারির তারিখ, পেমেন্ট টার্মস এবং ক্রয়ের আইটেম তালিকা ইনপুট করা।
* **2.2.2 Costing Setup:** প্রতি আইটেমের আনুমানিক একক ক্রয়মূল্য এবং প্রযোজ্য ভ্যাট রেট সেটআপ করা।

### 2.3 PO Status Pipeline & Lifecycle
* **2.3.1 Pipeline Stages:** `Draft` ➔ `Issued` ➔ `Partially Received` ➔ `Completed` / `Cancelled`।

---

## 3. 🧾 PURCHASE INVOICES / BILLS (ক্রয় ইনভয়েস বা বিল)

### 3.1 Bill Entry & Item Cost Breakdown
* **3.1.1 Invoice Input:** সাপ্লায়ারের পাঠানো আসল বিল নম্বর, চালান তারিখ, পণ্যের পরিমাণ, ডিসকাউন্ট এবং আইটেম ভ্যাট যুক্ত করা।

### 3.2 PO-to-Bill Conversion Engine
* **3.2.1 One-Click Conversion:** অনুমোদিত PO থেকে এক ক্লিকে পারচেজ ইনভয়েস তৈরি করা (PO স্ট্যাটাস স্বয়ংক্রিয়ভাবে আপডেট হবে)।

### 3.3 Landed Cost Allocation Engine
* **3.3.1 Landed Cost Breakdown:** আন্তর্জাতিক বা স্থানীয় ক্রয়ের ক্ষেত্রে শিপিং চার্জ, কাস্টমস শুল্ক, এবং পোর্ট হ্যান্ডলিং ফি পণ্যের মূল্যের সাথে যুক্ত করা।
* **3.3.2 Unit Cost Calculation Formula:**
  $$\text{Effective Unit Cost}_i = \text{Base Unit Price}_i + \left( \frac{\text{Line Total}_i}{\text{Invoice Total}} \times \text{Total Shipping/Customs Fee} \right)$$

---

## 4. 📦 GOODS RECEIPT & INVENTORY UPDATES (পণ্য গ্রহণ)

### 4.1 Delivery Note / GRN Receipt
* **4.1.1 Warehouse Inspection:** গুদামে পৌঁছানো পণ্য পরীক্ষা করা এবং আংশিক বা সম্পূর্ণ রিসিভ (GRN - Goods Received Note) তৈরি করা।
* **4.1.2 Location Mapping:** প্রাপ্ত পণ্য নির্দিষ্ট ওয়্যারহাউস ও বিন/র‍্যাক লোকেশনে অ্যাসাইন করা।

### 4.2 Real-Time Inventory Stock Update
* **4.2.1 Stock Addition Entry:** চালানে রিসিভ করা পণ্যের পরিমাণ মূল ইনভেন্টরিতে বৃদ্ধি পাবে:
  * `Debit: Warehouse Inventory (Asset)`
  * `Credit: Goods Received Not Invoiced (GRNI) / Accounts Payable`

---

## 5. 💸 SUPPLIER PAYMENTS (সরবরাহকারী পেমেন্ট)

### 5.1 Bill Payment Entry (Full & Partial)
* **5.1.1 Payment Vouchers:** নির্দিষ্ট ক্রয়ের বিলের বিপরীতে ক্যাশ, ব্যাংক ট্রান্সফার বা চেকে পেমেন্ট এন্ট্রি দেওয়া।
* **5.1.2 Accounting Entry:**
  * `Debit: Accounts Payable (Supplier)`
  * `Credit: Cash / Bank Account`

### 5.2 Advance Supplier Payments
* **5.2.1 Advance Voucher:** কোনো বিল ছাড়া অগ্রিম পেমেন্ট প্রদান করা এবং সাপ্লায়ার লেজারে ডেবিট রেকর্ড রাখা:
  * `Debit: Supplier Advance Payments (Asset)`
  * `Credit: Cash / Bank`

---

## 6. 🔄 PURCHASE RETURNS & DEBIT NOTES (ক্রয় ফেরত)

### 6.1 Return Generation & Stock Deduction
* **6.1.1 Damaged Goods Return:** ক্ষতিগ্রস্ত বা ভুল পণ্য সাপ্লায়ারের নিকট ফেরত পাঠানো।
* **6.1.2 Inventory Reduction:** ফেরত পাঠানো পণ্যের সমপরিমাণ সংখ্যা ওয়্যারহাউস স্টক থেকে কমানো।

### 6.2 Debit Note & Balance Adjustment
* **6.2.1 Debit Note Entry:** ফেরত পণ্যের সমপরিমাণ টাকার ডেবিট নোট ইস্যু করা এবং সাপ্লায়ার লেজারে অ্যাডজাস্ট করা:
  * `Debit: Accounts Payable (Supplier)`
  * `Credit: Purchase Returns / Inventory`

---

## 7. 💾 MongoDB Schemas for Purchase System

```javascript
// models/PurchaseSystemModels.js
const mongoose = require('mongoose');

// 1. Supplier Schema
const SupplierSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  code: { type: String, unique: true },
  contactPerson: String,
  phone: { type: String, required: true },
  email: String,
  taxNumber: String,
  address: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierGroup' },
  openingBalance: { type: Number, default: 0 },
  openingBalanceType: { type: String, enum: ['DEBIT', 'CREDIT'], default: 'CREDIT' },
  status: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Purchase Invoice (Bill) Schema
const PurchaseInvoiceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierInvoiceNo: String,
  billNumber: { type: String, required: true, unique: true },
  billDate: { type: Date, default: Date.now },
  dueDate: Date,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    unitPrice: Number,
    landedCostPerUnit: Number,
    taxRate: Number,
    taxAmount: Number,
    total: Number
  }],
  subtotal: Number,
  landedChargesTotal: { type: Number, default: 0 },
  taxTotal: Number,
  grandTotal: Number,
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' }
}, { timestamps: true });

module.exports = {
  Supplier: mongoose.model('Supplier', SupplierSchema),
  PurchaseInvoice: mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema)
};
```
