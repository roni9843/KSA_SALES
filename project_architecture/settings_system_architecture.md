# ⚙️ Settings System Architecture & Functional Specification
## (সিস্টেম সেটআপ ও কনফিগারেশন মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 🏛️ TAX SETTINGS (ট্যাক্স সেটআপ)

### 1.1 VAT & Custom Tax Rates
* **1.1.1 Tax Bracket Definitions:** ভ্যাট রেট (যেমন: 15% Saudi VAT, 5% UAE VAT, 0% Zero-Rated) যোগ করা।
* **1.1.2 Compound & Inclusive Tax:** পণ্যের মূল্যের সাথে ইনক্লুসিভ ভ্যাট (Tax Inclusive) নাকি এক্সক্লুসিভ ভ্যাট হিসাব হবে তা সেটআপ করা।

---

## 2. 🔢 AUTO NUMBER SETTINGS (অটো নাম্বারিং সিকোয়েন্স)

### 2.1 Sequence Generator Engine
* **2.2.1 Document Format Parameters:**
  * Invoice Prefix: `INV`
  * Fiscal Year Tag: `2026`
  * Padding Digits: `5`
  * Generated Format: `INV-2026-00001`
* **2.2.2 Entity ID Formats:** কাস্টমার আইডি (`CLI-00001`), সাপ্লায়ার আইডি (`SUP-00001`), এবং ভাউচার কোড সিকোয়েন্স সেটআপ।

---

## 3. 🎨 TEMPLATES & CUSTOM FIELDS (টেমপ্লেট ও কাস্টম ফিল্ডস)

### 3.1 PDF Layout Customizer
* **3.1.1 Printable Styling:** ইনভয়েস ও কোটেশনের জন্য হেডার/ফুটার লোগো, কোম্পানি কালার থিম এবং ফন্ট সাইজ কাস্টমাইজেশন।

### 3.2 Dynamic Custom Fields Builder
* **3.2.1 Form Field Generator:** ইনভয়েস, কাস্টমার এন্ট্রি ফর্মে প্রয়োজনমতো নতুন কাস্টম ইনপুট ফিল্ড (Text, Number, Date, Select) তৈরি করা।

---

## 4. 💳 PAYMENT METHODS & GATEWAYS (পেমেন্ট সেটআপ)

### 4.1 Cash & Bank Accounts
* **4.1.1 Internal Payment Channels:** ক্যাশ কাউন্টার ড্রয়ার, পেটিকাশ এবং ব্যাংক অ্যাকাউন্ট চ্যানেল ম্যাপিং।

### 4.2 Online Payment Gateways
* **4.2.1 Integration Keys:** Stripe, PayPal, MFS (bKash/Nagad), এবং POS Terminal IP গেটওয়ে শংসাপত্র ও API Key কনফিগার করা।

---

## 5. 💾 MongoDB Schemas for Settings System

```javascript
// models/SettingsSystemModels.js
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, unique: true },
  shopName: { type: String, required: true },
  vatNumber: String,
  currency: { type: String, default: 'SAR' },
  invoicePrefix: { type: String, default: 'INV' },
  customerPrefix: { type: String, default: 'CLI' },
  defaultTaxRate: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = {
  Settings: mongoose.model('Settings', SettingsSchema)
};
```
