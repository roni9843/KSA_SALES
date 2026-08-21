# 💰 Sales System Architecture & Functional Specification
## (সেলস মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত ও ব্যবসায়িক বিবরণী)

---

## 1. 📄 INVOICES (ইনভয়েস মডিউল)

### 1.1 Create New Invoice & Client Details (ইনভয়েস তৈরি ও কাস্টমার ডিটেইলস)
* **1.1.1 Client Selection Logic:**
  * **1.1.1.1 Existing Client Selection:** ড্রপডাউন বা অটো-কমপ্লিট সার্চের মাধ্যমে নাম, ফোন বা কোড দিয়ে কাস্টমার বেছে নেওয়া। কাস্টমারের বকেয়া ও ক্রেডিট লিমিট রিয়েল-টাইমে প্রদর্শন করা।
  * **1.1.1.2 Quick New Client Creation:** ফর্ম থেকে না বের হয়ে ইনলাইন পপ-আপের মাধ্যমে দ্রুত নতুন কাস্টমার তৈরি করা।
* **1.1.2 Dates & Address Mapping:**
  * **1.1.2.1 Invoice Date & Due Date:** ইনভয়েসের তারিখ এবং পেমেন্ট পরিশোধের শেষ তারিখ সেটআপ (ডিফল্ট Payment Term Days প্রয়োগ হওয়া)।
  * **1.1.2.2 Billing & Shipping Addresses:** কাস্টমার প্রোফাইল থেকে প্রাথমিক বিলিং ও শিপিং এড্রেস স্বয়ংক্রিয়ভাবে লোড হওয়া এবং ম্যানুয়ালি পরিবর্তন সুবিধা।

### 1.2 Adding Items & Line Item Adjustments (পণ্য বা সেবা যুক্ত করা)
* **1.2.1 Product & Service Selection:**
  * **1.2.1.1 Stock Product Selection:** ইনভেন্টরি থেকে SKU, বারকোড বা নাম দিয়ে প্রোডাক্ট সিলেক্ট করা।
  * **1.2.1.2 Non-Stock / Custom Line Items:** সিস্টেমে অন্তর্ভুক্ত নয় এমন ইনস্ট্যান্ট সার্ভিস বা ফ্রি-টেক্সট কাস্টম আইটেম যুক্ত করা।
* **1.2.2 Quantity, Price, Serial & Warehouse Assignment:**
  * **1.2.2.1 Price & Quantity:** স্টক পরিমাণ (`stock_quantity`) লাইভ ডেস্কেটপ ভিউতে প্রদর্শন করা এবং নির্ধারিত বিক্রয়মূল্য আনা।
  * **1.2.2.2 Serial / IMEI & Batch Selection:** সিরিয়াল ভিত্তিক পণ্যের ক্ষেত্রে সুনির্দিষ্ট সিরিয়াল/IMEI নির্বাচন বা ফার্মা পণ্যের ক্ষেত্রে ব্যাচ ও মেয়াদ নির্বাচন।
  * **1.2.2.3 Warehouse Allocation:** প্রতি আইটেমের জন্য নির্দিষ্ট কোন ওয়্যারহাউস/স্টোর থেকে পণ্য ডেলিভারি হবে তা সিলেক্ট করা।

### 1.3 Tax & Discount Engine (ট্যাক্স ও ডিসকাউন্ট হিসাব)
* **1.3.1 Calculation Formulas & Order of Operations:**
  * **1.3.1.1 Item-Level Discount:** 
    * Flat Amount: $\text{Line Net} = (\text{Qty} \times \text{Price}) - \text{Discount Amount}$.
    * Percentage (%): $\text{Line Net} = (\text{Qty} \times \text{Price}) \times \left(1 - \frac{\text{Discount \%}}{100}\right)$.
  * **1.3.1.2 Item-Level Tax:** 
    * $\text{Line Tax} = \text{Line Net} \times \frac{\text{Tax Rate \%}}{100}$.
  * **1.3.1.3 Invoice-Level Overall Discount & Tax:**
    * $\text{Invoice Subtotal} = \sum \text{Line Nets}$.
    * $\text{Invoice Net} = \text{Invoice Subtotal} - \text{Overall Discount}$.
    * $\text{Grand Total} = \text{Invoice Net} + \sum \text{Taxes} + \text{Shipping Charge}$.
* **1.3.2 Multi-Tax Rates & Exemptions:**
  * **Exempted Tax:** জিরো-রেটেড বা ট্যাক্স মুক্ত পণ্যের জন্য সুনির্দিষ্ট ট্যাক্স রুল কোড (`VATEX-SA-29`) প্রয়োগ।

### 1.4 Additional Charges, Notes & Custom Fields
* **1.4.1 Extra Charges & Deposits:**
  * **Shipping / Freight Charge:** ইনভয়েসে পরিবহন খরচ আলাদা লাইন আইটেম হিসেবে যুক্ত করা।
  * **Down Payment / Deposit Allocation:** পূর্বের জমাকৃত অগ্রিম টাকা মোট বিল থেকে বিয়োগ করা।
* **1.4.2 Notes, Attachments & Custom Metadata:**
  * **Terms & Conditions:** ডিফল্ট শর্তাবলী লোড হওয়া এবং কাস্টম কাস্টমার নোট যুক্ত করা।
  * **Attachments:** কাজের অর্ডার বা বিলের কপি ফাইল (PDF/Image) যুক্ত রাখা।
  * **Custom Fields Data:** ইনভয়েস হেডারে কাস্টম ফিল্ড (যেমন: Salesperson Name, PO Ref No) ইনপুট।

### 1.5 Types of Invoices (ইনভয়েসের ধরন)
* **1.5.1 Standard Commercial Invoice (B2B):** পূর্ণাঙ্গ ট্যাক্স বিবরণী ও বায়ারের ট্যাক্স আইডি সহ ব্যবসায়িক ইনভয়েস।
* **1.5.2 Tax / ZATCA E-Invoice (B2B / B2C):**
  * Saudi ZATCA Phase 2 Cryptographic Stamp, SHA256 Invoice Hash Chaining এবং QR Code (TLV Tag 1-9) সহ ই-ইনভয়েস।
* **1.5.3 Recurring Invoices:** নির্দিষ্ট সময় পর পর অটো-ইনভয়েস জেনারেট হওয়ার সিডিউল রুলস।
* **1.5.4 Pro-Forma Invoice:** আনুমানিক পেমেন্ট ও চালানের প্রাক-অনুমোদন ইনভয়েস।

### 1.6 Invoice Actions & Operations (ইনভয়েস অ্যাকশনস)
* **1.6.1 Email & SMS Dispatch:** কাস্টমারের ইমেইল ও মোবাইলে পিডিএফ লিংক সহ রসিদ অটোমেটিক পাঠানো।
* **1.6.2 Public Link Sharing & Web View:** কোনো লগইন ছাড়া ক্লায়েন্টের সরাসরি বিল দেখার সিকিউর ওয়েব ইউআরএল জেনারেট করা।
* **1.6.3 Clone / Duplicate Invoice:** বিদ্যমান ইনভয়েস অবিকল কপি করে নতুন ইনভয়েসে রূপান্তর।
* **1.6.4 Print & PDF Generation:** বিভিন্ন টেমপ্লেট ডিজাইনে থার্মাল (80mm/58mm) বা A4/A5 সাইজে ইনভয়েস প্রিন্ট করা।

### 1.7 Financial Actions & Ledger Integration (আর্থিক সংশ্রব)
* **1.7.1 Payment Reception (Add Payment):** ক্যাশ, কার্ড, ব্যাংক বা ওয়ালেট মাধ্যমে আংশিক বা পূর্ণাঙ্গ পেমেন্ট এন্ট্রি দেওয়া।
* **1.7.2 Store Credit Application:** কাস্টমারের জমানো ক্রেডিট থেকে ইনভয়েসের বিল পরিশোধ।
* **1.7.3 Accounting Journal Postings:**
  * **Invoice Generation:** `Debit: Accounts Receivable`, `Credit: Sales Revenue`, `Credit: Output VAT Payable`.
  * **Inventory Deduction:** `Debit: Cost of Goods Sold (COGS)`, `Credit: Inventory`.

### 1.8 Tracking, Audit Log & Status Lifecycle
* **1.8.1 Status Lifecycle:** `Draft` ➔ `Unpaid` ➔ `Partially Paid` ➔ `Paid` ➔ `Overdue` / `Cancelled`.
* **1.8.2 Activity Log:** কে কখন ইনভয়েস তৈরি করেছে, প্রিন্ট নিয়েছে বা এডিট করেছে তার প্রতিটি ইউজার অ্যাকশন ট্র্যাকিং।

---

## 2. 📋 ESTIMATES / QUOTATIONS (এস্টিমেট বা কোটেশন)

### 2.1 Create Estimate & Validity Controls
* **2.1.1 Estimate Setup:** কাস্টমার নির্বাচন, পণ্যের তালিকা, ডিসকাউন্ট, ভ্যালিডিটি ডেট (মেয়াদ) এবং শর্তাবলী যোগ করে কোটেশন তৈরি করা।

### 2.2 Estimate Actions & Sharing
* **2.2.1 Distribution:** ইমেইলে ওয়েব লিংক পাঠানো, সরাসরি হোয়াটসঅ্যাপে শেয়ার করা এবং প্রিন্ট/পিডিএফ ফাইল রূপান্তর।

### 2.3 Estimate Conversion Engine
* **2.3.1 Acceptance Tracking:** কাস্টমার পোর্টাল বা ইমেইলের মাধ্যমে কোটেশন একসেপ্ট বা রিজেক্ট করা।
* **2.3.2 One-Click Conversion:** এক ক্লিকে কোটেশনকে সরাসরি **Sales Invoice** অথবা **Sales Order** এ রূপান্তর করা (কোটেশন স্ট্যাটাস `CONVERTED` লক হয়ে যাবে)।

---

## 3. 📦 SALES ORDERS (সেলস অর্ডার)

### 3.1 Create Sales Order & Delivery Scheduling
* **3.1.1 Order Setup:** গ্রাহকের চুক্তি অনুযায়ী পণ্যের অর্ডার রেকর্ড করা, আনুমানিক ডেলিভারি তারিখ এবং নির্দিষ্ট ওয়্যারহাউস নির্বাচন।

### 3.2 Order Tracking & Status Pipeline
* **3.2.1 Pipeline Stages:** `Pending` ➔ `Processing` ➔ `Partially Delivered` ➔ `Completed` / `Cancelled`.

### 3.3 Sales Order Conversion Engine
* **3.3.1 Invoice & Delivery Note Generation:** অর্ডারের তথ্যের ওপর ভিত্তি করে এক ক্লিকে **Delivery Note (চালান)** অথবা **Sales Invoice** প্রস্তুত করা।

---

## 4. 🚚 DELIVERY NOTES / WAYBILLS (ডেলিভারি নোট বা চালান)

### 4.1 Create Delivery Note
* **4.1.1 Generation Source:** Sales Order বা Sales Invoice থেকে স্বয়ংক্রিয়ভাবে চালান জেনারেট করা অথবা ম্যানুয়ালি পণ্য তালিকা দিয়ে নতুন ডেলিভারি নোট তৈরি করা।

### 4.2 Inventory Stock Deduction Logic
* **4.2.1 Real-Time Stock Movement:** ডেলিভারি নোট সাবমিট হওয়া মাত্রই নির্দিষ্ট ওয়্যারহাউস থেকে পণ্যের স্টক শারীরিক ও সিস্টেমেটিক্যালি কমে যাবে:
  * `Debit: Goods In-Transit / COGS Account`
  * `Credit: Warehouse Inventory`

### 4.3 Printable Logistics Documents
* **4.3.1 Packing Slip & Delivery Receipt:** প্যাকিং স্লিপ এবং কাস্টমারের স্বাক্ষর গ্রহণের জন্য ডেলিভারি রসিদ প্রিন্ট করা।

---

## 5. 🛒 POINT OF SALE - POS (পয়েন্ট অফ সেল)

### 5.1 POS High-Speed Billing Engine
* **5.1.1 Rapid POS Interface:**
  * **Barcode Scanning:** বারকোড স্ক্যান করা মাত্র সাথে সাথে কার্টে Qty +1 যুক্ত হওয়া।
  * **Touchscreen Interface:** দ্রুত ক্যাটাগরি ও প্রোডাক্ট আইকন স্পর্শ করে কার্টে যোগ করা।
  * **Split Payment Logic:** একই ইনভয়েসের জন্য কিছু অংশ নগদ, কিছু অংশ কার্ডে গ্রহণ।
  * **Offline Mode Sync:** ডেস্কেটপে ইন্টারনেট না থাকলেও সম্পূর্ণ বিট্রি বিক্রি চালু থাকা এবং ইন্টারনেট আসলে ক্লাউড সার্ভারে ডাটা সিঙ্ক হওয়া।

### 5.2 POS Shift Management Engine
* **5.2.1 Shift Lifecycle:** 
  * **Shift Open:** শুরুতে কাউন্টারের ওপেনিং ক্যাশ ব্যালেন্স (Opening Float) ইনপুট।
  * **Mid-Shift Cash Drop:** ক্যাশ ড্রয়ার থেকে অতিরিক্ত নগদ নিরাপদ স্থানে সরানো (Cash Out/In Entry)।
  * **Shift Close & Reconciliation:** শিফট শেষে ড্রয়ারের গচ্ছিত নগদ গণনা করা এবং সিস্টেম হিসাবের সাথে পার্থক্য (Cash Shortage/Excess) হিসাব করে শিফট ক্লোজিং রিপোর্ট জেনারেট করা।

---

## 6. 📅 INSTALLMENTS (কিস্তি ব্যবস্থাপনা)

### 6.1 Create Installment Plan
* **6.1.1 Plan Configuration:** যেকোনো সেলস ইনভয়েসকে কিস্তি প্ল্যানে রূপান্তর করা।
* **6.1.2 Financial Terms:** ডাউনপেমেন্ট সংগ্রহ, কিস্তির সংখ্যা (N), কিস্তির সময়কাল (Weekly/Monthly), এবং সুদের মডেল (Flat Rate / Reducing Balance) সেটআপ।
* **6.1.3 Repayment Schedule Generator:** প্রতি কিস্তির সুনির্দিষ্ট জমার তারিখ, আসল ও সুদের পরিমাণের শিডিউল জেনারেট করা।

### 6.2 Installment Collection & Reminders
* **6.2.1 Collection Entry:** গ্রাহক নির্দিষ্ট কিস্তি জমা দিলে পেমেন্ট রিসিভ তৈরি এবং বাকি কিস্তির ট্র্যাকিং।
* **6.2.2 Overdue Penalties & Reminders:** কিস্তির তারিখ পার হলে স্বয়ংসক্রিয় লেট ফি যুক্ত হওয়া এবং হোয়াটসঅ্যাপ/এসএমএস রিমাইন্ডার পাঠানো।

---

## 7. 🔄 RETURNS & CREDIT NOTES (রিটার্ন এবং ক্রেডিট নোট)

### 7.1 Create Credit Note
* **7.1.1 Return Generation:** আগের ইনভয়েস সিলেক্ট করে আংশিক বা সম্পূর্ণ পণ্য ফেরতের ক্রেডিট নোট জেনারেট করা অথবা ম্যানুয়ালি এন্ট্রি দেওয়া।

### 7.2 Return & Restocking Management
* **7.2.1 Inventory Restock Logic:** ফেরত আসা পণ্য ভালো থাকলে ওয়্যারহাউসে পুনর্সংযোজন (Restock) করা অথবা ক্ষতিগ্রস্ত হলে ড্যামেজ স্টকে এন্ট্রি দেওয়া।
* **7.2.2 Client Refund / Store Credit:** গ্রাহককে নগদ টাকা ফেরত দেওয়া অথবা তার কাস্টমার ওয়ালেটে স্টোর ক্রেডিট হিসেবে যুক্ত করা।

---

## 8. ⚙️ SALES SETTINGS & TARGETS (সেলস সেটিংস এবং টার্গেট)

### 8.1 Customization & Template Settings
* **8.1.1 PDF & Invoice Template Designer:** ইনভয়েস, কোটেশন ও চালানের লেআউট, লোগো, ফন্ট ও কালার স্কিম কাস্টমাইজ করা।
* **8.1.2 Sequence & Numbering:** ডকুমেন্টের প্রিফিক্স ও অটো-ইনক্রিমেন্টাল আইডি ফরম্যাট সেটআপ (`INV-2026-00001`, `EST-2026-00001`)।
* **8.1.3 Online Payment Gateways:** Stripe, PayPal, MFS গেটওয়ে লিংক যুক্ত করা যাতে কাস্টমার পে-বাটনে ক্লিক করে বিল দিতে পারে।

### 8.2 Sales Targets & Commission Engine
* **8.2.1 Sales Representative Targets:** সেলস এজেন্টদের জন্য বিক্রয় মূল্য (Revenue) বা বিক্রয়ের ইউনিটের (Volume) ওপর ভিত্তি করে মাসিক/বার্ষিক টার্গেট সেটআপ।
* **8.2.2 Tiered Commission Calculation Rules:**
  * বিক্রয়ের মোট পরিমাণের ওপর শতাংশ (e.g. 5% Commission)।
  * পণ্যের লাভ (Profit Margin) এর ওপর কমিশন।
  * স্ল্যাব ভিত্তিক কমিশন (Tier 1: 2%, Tier 2: 5%, Tier 3: 8%)।
* **8.2.3 Commission Approval & Accounting Voucher:**
  * টার্গেট হিসাব কষে অনুমোদন করা এবং সরাসরি পে-রোলে বা ক্যাশ ভাউচারে কমিশন প্রদান:
  * `Debit: Sales Commission Expense`
  * `Credit: Commission Payable / Cash`

---

## 9. 💾 MongoDB Schemas for Sales System

```javascript
// models/SalesSystemModels.js
const mongoose = require('mongoose');

// 1. Invoice Line Item Sub-schema
const InvoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: String,
  serialNumber: String,
  batchNumber: String,
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  lineDiscount: { type: Number, default: 0 },
  lineDiscountType: { type: String, enum: ['FLAT', 'PERCENT'], default: 'FLAT' },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

// 2. Sales Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceType: { type: String, enum: ['STANDARD', 'TAX_ZATCA', 'RECURRING', 'PROFORMA'], default: 'STANDARD' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  
  billingAddress: Object,
  shippingAddress: Object,
  
  items: [InvoiceItemSchema],
  
  subtotal: { type: Number, required: true },
  overallDiscount: { type: Number, default: 0 },
  taxTotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, required: true },
  
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'UNPAID' },
  
  // Saudi ZATCA E-Invoicing Specs
  zatca: {
    uuid: String,
    invoiceHash: String,
    previousInvoiceHash: String,
    qrCodeBase64: String,
    submissionStatus: { type: String, enum: ['PENDING', 'REPORTED', 'CLEARED', 'FAILED'], default: 'PENDING' }
  },
  
  termsAndConditions: String,
  clientNotes: String,
  customFields: { type: Map, of: String }
}, { timestamps: true });

// 3. POS Shift Management Schema
const PosShiftSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openingFloat: { type: Number, required: true },
  closingCashExpected: Number,
  closingCashActual: Number,
  cashDifference: Number,
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  openedAt: { type: Date, default: Date.now },
  closedAt: Date
}, { timestamps: true });

// 4. Installment Plan Schema
const InstallmentPlanSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  totalPrincipal: Number,
  downPayment: Number,
  interestRate: Number,
  tenureMonths: Number,
  schedules: [{
    installmentNo: Number,
    dueDate: Date,
    principalAmount: Number,
    interestAmount: Number,
    totalAmount: Number,
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' }
  }]
}, { timestamps: true });

module.exports = {
  Invoice: mongoose.model('Invoice', InvoiceSchema),
  PosShift: mongoose.model('PosShift', PosShiftSchema),
  InstallmentPlan: mongoose.model('InstallmentPlan', InstallmentPlanSchema)
};
```

---
