# ⚙️ Settings, Apps & Account System Architecture
## (সেটিংস, অ্যাপস ও অ্যাকাউন্টস মডিউলের বিস্তারিত ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 🏛️ TAX SETTINGS (ট্যাক্স সেটিংস)

### 1.1 Add New Tax & Set Tax Rates
* **1.1.1 Tax Bracket Setup:** ভ্যাট বা কাস্টম ট্যাক্স রেট তৈরি করা (যেমন: 15% Saudi VAT, 5% UAE VAT, 0% Zero-Rated, 10% Withholding Tax)।
* **1.1.2 Sales & Purchase Default Taxes:** বিক্রয় (Sales Invoices) বা ক্রয়ের (Purchase Bills) সময় স্বয়ংক্রিয়ভাবে ডিফল্ট ট্যাক্স রেট বসে যাওয়ার নিয়ম সেটআপ।

### 1.2 Tax Exemption Rules
* **1.2.1 Exemption Certificate Setup:** নির্দিষ্ট রপ্তানি পণ্য, সরকারি প্রতিষ্ঠান বা ট্যাক্স মুক্ত ক্যাটাগরির জন্য ভ্যাট মওকুফ কোড (`VATEX-SA-29`) প্রয়োগ করা।

---

## 2. 💳 PAYMENT METHODS (পেমেন্ট মেথড)

### 2.1 Offline Payment Channels
* **2.1.1 Internal Channels:** Cash Drawer, Bank Wire Transfer, Cheque, এবং Mobile Banking (bKash/Nagad/MFS) পেমেন্ট অ্যাকাউন্ট যুক্ত করা।

### 2.2 Online Payment Gateways Integration
* **2.2.1 Gateway Credentials Setup:** Stripe, PayPal, Paymob, HyperPay, এবং POS Terminal IP চ্যানেল যুক্ত করা যাতে কাস্টমার পে-বাটনে ক্লিক করে বিল মেটাতে পারে।

### 2.3 Branch-Wise Payment Assignment
* **2.3.1 Branch Assignment:** নির্দিষ্ট আউটলেট বা শাখার জন্য নির্দিষ্ট ক্যাশ কাউন্টার ও পেমেন্ট চ্যানেল অ্যাসাইন করা।

---

## 3. 🔢 AUTO NUMBER SETTINGS (অটো নাম্বারিং)

### 3.1 Document Sequences & Prefixes
* **3.1.1 Parameter Configuration:**
  * Invoice Prefix & Suffix: `INV-2026-00001`
  * Purchase Order Sequence: `PO-2026-00001`
  * Client ID Sequence: `CLI-00001`
  * Supplier ID Sequence: `SUP-00001`
  * Work Order Sequence: `WO-2026-00001`
* **3.1.2 Starting Number Control:** অর্থবছর অনুযায়ী শুরুর নম্বর সেট করা এবং ডুপ্লিকেট নম্বর ব্লক করা।

---

## 4. ✉️ SMTP SETTINGS (ইমেইল সার্ভার সেটিংস)

### 4.1 Custom Email Server Configuration
* **4.1.1 Mail Credentials:** Host Name, Port (587/465), Username, Password, SSL/TLS সিকিউরিটি নির্বাচন।
* **4.1.2 Sender Profile:** প্রেরকের নাম (Sender Name) এবং প্রেরকের ইমেইল এড্রেস (Sender Email) সেটআপ।

---

## 5. 🔌 APPS MANAGER & EXTERNAL INTEGRATION (অ্যাপস ও এপিআই)

### 5.1 Modular Feature Toggles (Apps Manager)
* **5.1.1 Enable / Disable Modules:** প্রয়োজন অনুযায়ী HR, Inventory, Manufacturing, POS, বা Rental মডিউল চালু বা বন্ধ রাখার ব্যবস্থা।

### 5.2 External Integrations & Webhooks
* **5.2.1 API Token Generator:** থার্ড-পার্টি অ্যাপের জন্য সিকিউর Bearer API Access Tokens জেনারেট করা।
* **5.2.2 Webhook Triggers:** সিস্টেমে ঘটনা ঘটা মাত্র (যেমন: `invoice.created`, `payment.received`, `customer.added`) থার্ড-পার্টি সার্ভারে রিয়েল-টাইম পে-লোড পাঠানোর ওয়েবহুক জেনারেটর।

---

## 6. 📱 SMS GATEWAY SETTINGS (এসএমএস সেটিংস)

### 6.1 SMS Gateways Integration
* **6.1.1 API Connection:** Twilio, Unifonic, BulkSMS বা স্থানীয় ট্রানজ্যাকশনাল এসএমএস গেটওয়ে API যুক্ত করা।
* **6.1.2 Automated SMS Triggers:** ইনভয়েস তৈরি, পেমেন্ট প্রাপ্তি, মেম্বারশিপ মেয়াদ বা অ্যাপয়েন্টমেন্টের দিনে স্বয়ংক্রিয় এসএমএস মেসেজ অ্যালার্ট পাঠানো।

---

## 7. 🏢 BRANCHES MANAGEMENT (শাখা পরিচালনা)

### 7.1 Branch Setup & Resource Mapping
* **7.1.1 Add New Branch:** একাধিক শোরুম বা ব্রাঞ্চ তৈরি করা এবং স্থান কনফিগার করা।
* **7.1.2 Assign Staff & Stock:** নির্দিষ্ট ব্রাঞ্চে কর্মী নিয়োগ এবং সুনির্দিষ্ট গুদাম/ইনভেন্টরি স্টক ট্যাগ করা।

---

## 8. 🎨 TEMPLATES & CUSTOM FIELDS (টেমপ্লেট ও কাস্টম ফিল্ডস)

### 8.1 PDF Layout Customizer
* **8.1.1 Invoice Layout Styling:** কোম্পানির লোগো, থিম কালার, হেডার/ফুটার টেক্সট ও ফন্ট স্টাইল কাস্টমাইজ করা।
* **8.1.2 Custom Fields Builder:** ফর্ম বা ইনভয়েসে কাস্টম ইনপুট ফিল্ড (Text, Select, Date) যুক্ত করা।
* **8.1.3 Default Terms & Conditions:** ইনভয়েস ও কোটেশনের জন্য ডিফল্ট শর্তাবলী যোগ করা।

---

## 9. 🏢 MY ACCOUNT & SUBSCRIPTIONS (কোম্পানি ও অ্যাকাউন্ট)

### 9.1 Company Profile & Timezone
* **9.1.1 Master Business Profile:** কোম্পানির নাম, বাণিজ্যিক লাইসেন্স, লোগো, ঠিকানা আপডেট করা।
* **9.1.2 Timezone & Currency:** টাইমজোন (e.g. Asia/Riyadh, Asia/Dhaka), কারেন্সি (SAR, BDT, USD), এবং ডেট ফরম্যাট সেটিং।

### 9.2 Upgrade Account & Payments
* **9.2.1 Subscription Overview:** বর্তমান ডাফট্রা/সিস্টেম প্ল্যান ভিউ করা।
* **9.2.2 Upgrade & Renewal:** সাবস্ক্রিপশন অনলাইন পেমেন্টের মাধ্যমে রিনিউ করা এবং সাবস্ক্রিপশন বিট্রি ইনভয়েসের রসিদ দেখা।

---

## 10. 💾 MongoDB Schemas for Settings & System Apps

```javascript
// models/SystemSettingsModels.js
const mongoose = require('mongoose');

// 1. Settings Schema
const SettingsSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, unique: true },
  companyName: { type: String, required: true },
  logoUrl: String,
  vatNumber: String,
  crNumber: String,
  address: String,
  currency: { type: String, default: 'SAR' },
  timezone: { type: String, default: 'Asia/Riyadh' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  
  // Sequences
  sequences: {
    invoicePrefix: { type: String, default: 'INV' },
    poPrefix: { type: String, default: 'PO' },
    customerPrefix: { type: String, default: 'CLI' },
    startingNumber: { type: Number, default: 1 }
  },
  
  // Enabled Modules
  enabledModules: {
    hr: { type: Boolean, default: true },
    inventory: { type: Boolean, default: true },
    pos: { type: Boolean, default: true },
    manufacturing: { type: Boolean, default: false },
    rental: { type: Boolean, default: false }
  }
}, { timestamps: true });

// 2. Branch Schema
const BranchSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  code: { type: String, unique: true },
  location: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
}, { timestamps: true });

module.exports = {
  Settings: mongoose.model('Settings', SettingsSchema),
  Branch: mongoose.model('Branch', BranchSchema)
};
```
