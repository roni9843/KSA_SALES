# 👥 Daftra-Grade Client & CRM System Architecture
## (কমপ্লিট ক্লায়েন্ট ও সিআরএম সিস্টেমের বিস্তারিত ৪-লেভেল প্রযুক্তিগত ও ব্যবসায়িক বিবরণী)

---

## 1. 📂 MANAGE CLIENTS (ক্লায়েন্ট পরিচালনা)

### 1.1 New Client Registration & Profile Management
* **1.1.1 Individual vs Corporate Profile Types:**
  * **1.1.1.1 Individual Client Schema:** Full Name, Phone, Email, National ID / Iqama Number (`Uakam_no`), Personal Address.
  * **1.1.1.2 Corporate / Business Schema:** Company Name, Commercial Register (CR Number), Tax Registration Number (`taxNumber`), Authorized Person Contact, Company Billing Address.
* **1.2.1 Opening Balance Configuration & Accounting Logic:**
  * **1.2.1.1 Debit Opening Balance (Customer Debt):** ক্লায়েন্টের কাছে কোম্পানির পূর্বের বকেয়া পাওনা এন্ট্রি এবং তারিখ নির্ধারণ (`openingBalanceDate`)।
    * `Debit: Accounts Receivable (Customer)`
    * `Credit: Opening Balance Equity`
  * **1.2.1.2 Credit Opening Balance (Customer Advance):** ক্লায়েন্টের কাছে কোম্পানির পূর্বের জমা অ্যাডভান্স এন্ট্রি।
    * `Debit: Opening Balance Equity`
    * `Credit: Customer Advance / Wallet Liability`
* **1.3.1 Client Grouping & Classification:**
  * **1.3.1.1 Client Groups Setup:** গ্রাহকদের ধরন অনুযায়ী শ্রেণীবিভাগ (যেমন: Retail, Wholesale, Corporate, VIP, Distributors)।
  * **1.3.1.2 Price List Assignment Engine:** নির্দিষ্ট গ্রুপকে কাস্টম প্রাইস লিস্ট বা শতাংশ ডিসকাউন্ট হারের সাথে যুক্ত করা (POS সিলেক্ট করার সাথে সাথে রেট পরিবর্তন হবে)।
  * **1.3.1.3 Category & Geographic Mapping:** এলাকা বা রিজিওন (City, Region, Zone) এবং বিজনেস সেক্টর অনুযায়ী ক্লায়েন্ট ক্যাটাগরাইজেশন।
* **1.4.1 Client Ledger & Account Statements:**
  * **1.4.1.1 Real-Time Ledger Engine:** ইনভয়েস, পেমেন্ট, ক্রেডিট নোট এবং সামঞ্জস্যকরণের রিয়েল-টাইম হিসাব।
  * **1.4.1.2 Account Statement Export & Dispatch:** তারিখ নির্দিষ্ট করে লেজার ফিল্টার করা, PDF রসিদ প্রস্তুত করা এবং সরাসরি ক্লায়েন্টের ইমেইলে পাঠানো।
* **1.5.1 Bulk Data Import & Duplicate Prevention:**
  * **1.5.1.1 Excel / CSV Batch Importer:** কলাম ম্যাপিং সুবিধা সহ একবারে হাজার হাজার কাস্টমার ডাটাবেসে আপলোড করা।
  * **1.5.1.2 Duplicate Prevention Rules:** মোবাইল নম্বর (`phone`), ইমেইল (`email`), অথবা ট্যাক্স নিবন্ধন নম্বর (`taxNumber`) দিয়ে ডুপ্লিকেট এন্ট্রি ব্লক করা।
* **1.6.1 Credit Limit & Payment Term Controls:**
  * **1.6.1.1 Credit Limit Amount Enforcement:** ক্লায়েন্টের জন্য সর্বোচ্চ বকেয়া লিমিট সেটআপ (যেমন: 50,000 SAR)।
  * **1.6.1.2 Credit Period Days Limit:** বাকি পরিশোধের মেয়াদকাল দিন হিসেবে সেটআপ (যেমন: 30 Days)।
  * **1.6.1.3 Automated POS Checkout Block:** $\text{Current Balance} + \text{New Invoice} > \text{Credit Limit}$ হলে সিস্টেম স্বয়ংক্রিয় সেলস ট্রানজ্যাকশন ব্লক করবে।
* **1.7.1 Client Activity Audit Trail:**
  * **1.7.1.1 Event Log Data:** প্রোফাইল তৈরি, ডাটা সংশোধন, স্ট্যাটাস পরিবর্তন, পেমেন্ট ভাউচার এবং ইউজার আইপি ও সময় সহ সম্পূর্ণ লগ রেকর্ড।

---

## 2. ⚙️ CLIENT OPERATIONS (ক্লায়েন্ট অপারেশনস)

### 2.1 Direct Document Generation from Profile
* **2.1.1 Sales & Work Orders:** কাস্টমার ফাইল থেকে সরাসরি এক ক্লিকে নতুন Sales Order বা Technical Work Order (জব কার্ড) তৈরি করা।
* **2.1.2 Invoices, Estimates & Credit Notes:** ক্লায়েন্টের বিবরণ স্বয়ংক্রিয়ভাবে যুক্ত হয়ে ইনভয়েস, কোটেশন বা ক্রেডিট নোটের স্ক্রিন চালু হওয়া।

### 2.2 Barcode & Identification Systems
* **2.2.1 Auto Barcode Generator:** কাস্টমার কোড বা আইডি থেকে Code128 / QR Code বারকোড জেনারেট করা।
* **2.2.2 Thermal Printing & ID Badge:** থার্মাল প্রিন্টারে বারকোড বা কিউআর কোড যুক্ত ক্লায়েন্ট আইডি কার্ড প্রিন্ট করা।

### 2.3 Address Book & Location Management
* **2.3.1 Multiple Billing & Shipping Addresses:** একটি ক্লায়েন্টের অধীন একাধিক শাখা বা শিপিং ঠিকানা সংরক্ষণ।
* **2.3.2 Checkout Address Selection:** ইনভয়েস বা ডেলিভারি চালান তৈরির সময় নির্দিষ্ট ঠিকানা নির্বাচন।

### 2.4 Notes, Attachments & Media Hub
* **2.4.1 Pinned Notes & Comments:** ক্লায়েন্ট প্রোফাইলে গুরুত্বপূর্ণ নোটিশ পিন (Pinned Note) করে রাখা।
* **2.4.2 Document Storage Hub:** ট্রেড লাইসেন্স, পাসপোর্ট, চুক্তিপত্রের ফাইল আপলোড ও সংরক্ষণ করা।

### 2.5 Communication Hub (Email, SMS & Direct WhatsApp)
* **2.5.1 Automated Transactional Alerts:** এসএমএস ও ইমেইলের মাধ্যমে ট্রানজ্যাকশন ও রিমাইন্ডার পাঠানো।
* **2.5.2 Direct WhatsApp Chat Launcher:** কোনো অ্যাপ ছাড়া সরাসরি ব্রাউজার থেকেই `https://wa.me/phone` এর মাধ্যমে ওয়াটসঅ্যাপ চ্যাট ওপেন করা।

### 2.6 Staff Assignment & Security
* **2.6.1 Assigning Dedicated Account Managers:** নির্দিষ্ট ক্লায়েন্টের দায়িত্বে নির্দিষ্ট অ্যাকাউন্ট ম্যানেজার (Staff Member) নিয়োগ।
* **2.6.2 Role Visibility Restrictions:** সাধারণ স্টাফ যেন কেবল তার দায়িত্বপ্রাপ্ত ক্লায়েন্টের ডাটা দেখতে পারে সে পারমিশন যুক্ত করা।

### 2.7 Account Lifetime Actions
* **2.7.1 Suspending Client Accounts:** অ্যাকাউন্ট স্থগিত (Suspend) করা যাতে উক্ত ক্লায়েন্টের নামে নতুন ইনভয়েস না করা যায়।
* **2.7.2 Archiving vs Hard Deletion Safety:** পূর্বে লেনদেন থাকা ক্লায়েন্টদের ক্ষেত্রে সিস্টেম হার্ড ডিলিট ব্লক করবে এবং সেটিকে সেফলি আর্কাইভ (Archive) করে রাখবে।

---

## 3. 🌐 CLIENT PORTAL (ক্লায়েন্ট পোর্টাল)

### 3.1 Portal Authentication & Credentials
* **3.1.1 Activation & Credential Dispatch:** এক ক্লিকে পোর্টাল এক্সেস চালু করা এবং ক্লায়েন্টকে ইউজারনেম ও পাসওয়ার্ড ইমেইল/এসএমএসে পাঠানো।
* **3.1.2 Password Encryption:** bcrypt হ্যাশিং ব্যবহার করে পাসওয়ার্ড সংরক্ষণ এবং রি-সেট সুবিধা।

### 3.2 Self-Service Dashboard
* **3.2.1 Financial Overview:** ক্লায়েন্ট নিজে লগইন করে তার ইনভয়েস, বকেয়া বিল এবং প্রাক্কলন (Estimate) দেখতে পারবে।
* **3.2.2 Online Invoice Payment:** পেমেন্ট গেটওয়ে (Stripe, Card, MFS) ব্যবহার করে পোর্টালেই বকেয়া ইনভয়েস পরিশোধ করা।
* **3.2.3 Downloads Hub:** ইনভয়েস PDF, পেমেন্ট রসিদ এবং লেজার স্টেটমেন্ট ডাউনলোড করার সুবিধা।

### 3.3 Estimate Approval & Support Tickets
* **3.3.1 One-Click Estimate Approval:** পোর্টাল থেকে ক্লায়েন্ট কোটেশন একসেপ্ট (Accept) বা রিজেক্ট (Reject) করতে পারবে।
* **3.3.2 Support Ticket Creation:** যেকোনো সেবার ত্রুটি বা সমস্যার জন্য টিকিট অপশন সার্ভিস গ্রহণ।

---

## 4. 📆 CLIENTS FOLLOW UP & APPOINTMENTS (ফলো-আপ ও অ্যাপয়েন্টমেন্ট)

### 4.1 CRM Lead & Pipeline Engine
* **4.1.1 Lead Pipeline Stages:** Prospect ➔ Contacted ➔ Proposal Sent ➔ Negotiating ➔ Closed Won / Lost।
* **4.1.2 Call Logs & Activity Notes:** কথা বলা বা মিটিংয়ের সারাংশ লিখে রাখা এবং সেলস এজেন্টের কাজের দায়িত্ব বণ্টন।
* **4.1.3 Reminder Alarms:** নির্ধারিত তারিখে স্বয়ংক্রিয় ড্যাশবোর্ড নোটিফিকেশন ও অ্যালার্ম।

### 4.2 Appointment Scheduling & Calendar Engine
* **4.2.1 Interactive Calendar Grid:** সময় স্লট অনুযায়ী (Time Slot Grid) অ্যাপয়েন্টমেন্ট বুক করা।
* **4.2.2 Staff & Resource Mapping:** নির্দিষ্ট ডাক্তার, স্টাইলিস্ট বা কনসালট্যান্টের খালি সময় দেখে বুকিং নেওয়া।
* **4.2.3 Online Self-Booking Link:** ক্লায়েন্ট নিজে লিংক থেকে ফ্রী স্লট সিলেক্ট করে বুকিং দেওয়ার ব্যবস্থা।

### 4.3 Automated Reminders & Notifications
* **4.3.1 WhatsApp Reminder Engine:** অ্যাপয়েন্টমেন্টের ১ ঘণ্টা আগে স্বয়ংক্রিয় হোয়াটসঅ্যাপ মেসেজ পৌঁছানো।
* **4.3.2 Cancellation & Reschedule Alerts:** অ্যাপয়েন্টমেন্ট পরিবর্তন বা বাতিল হলে তাৎক্ষণিক এসএমএস/ইমেইল অ্যালার্ট।

---

## 5. 🏷️ CLIENTS ATTENDANCE (ক্লায়েন্ট হাজিরা)

### 5.1 Access Pass & Identification Scan
* **5.1.1 Scanner Integration:** বারকোড, কিউআর কোড বা আরএফআইডি (RFID) কার্ড স্ক্যান করে ক্লায়েন্টের প্রবেশ ট্র্যাকিং।
* **5.1.2 Gate Lock Trigger & Validity Check:** মেম্বারশিপের মেয়াদ থাকলে গেট সিস্টেমের জন্য সাকসেস সিগন্যাল পাঠানো।

### 5.2 Attendance Sessions & Visit Counter
* **5.2.1 Session Log Data:** তারিখ, প্রবেশের সময়, স্থান এবং ইনস্ট্রাক্টর বা ট্রেইনারের নাম রেকর্ড।
* **5.2.2 Package Visit Deduction:** নির্দিষ্ট ভিজিট প্যাকেজ (যেমন: ১০টি ক্লাসের প্যাকেজ) থেকে প্রতি প্রবেশের সাথে ১ ভিজিট বিয়োগ হওয়া।

---

## 6. 🪙 POINTS & CREDITS (পয়েন্ট এবং ক্রেডিট)

### 6.1 Store Credit & Customer Wallet Engine
* **6.1.1 Adding Advance Cash Deposit:** ইনভয়েস ছাড়া অগ্রিম টাকা জমা গ্রহণ করে ওয়ালেটে ক্রেডিট যুক্ত করা।
* **6.1.2 Wallet Ledger Accounting:**
  * `Debit: Cash / Bank`
  * `Credit: Customer Wallet Liability`
* **6.1.3 Store Credit Refund:** পণ্য ফেরত দিলে নগদ টাকা না দিয়ে কাস্টমার ওয়ালেটে রিফান্ড জমা করা।

### 6.2 Loyalty Points Program
* **6.2.1 Spending-to-Points Accrual Formula:**
  * $\text{Points} = \lfloor \frac{\text{Net Bill Total}}{\text{Spend Unit Rate}} \rfloor \times \text{Points Rate}$.
* **6.2.2 Points-to-Cash Redemption Logic:**
  * $\text{Discount Amount} = \text{Redeemed Points} \times \text{Point Cash Value}$.
* **6.2.3 Tiered Loyalty Clubs:** Bronze, Silver, Gold, Platinum ব্যাজ ও সুবিধা সেটআপ।

---

## 7. 💳 MEMBERSHIPS & SUBSCRIPTIONS (মেম্বারশিপ)

### 7.1 Package Definitions & Rules
* **7.1.1 Subscription Cycles:** সাপ্তাহিক, মাসিক, তিন-মাসিক বা বার্ষিক সাবস্ক্রিপশন প্যাকেজ।
* **7.1.2 Entitlements & Access Rules:** প্যাকেজের অধীনে প্রাপ্য সার্ভিস ও সময়সীমা নির্ধারণ।

### 7.2 Lifecycle Automation
* **7.2.1 Renewal Alerts & Auto Invoicing:** মেয়াদ শেষের পূর্বে এসএমএস অ্যালার্ট এবং অটো-রিনিউ ইনভয়েস প্রস্তুত হওয়া।
* **7.2.2 Auto-Freeze on Expiration:** নির্ধারিত সময়ের মধ্যে নবায়ন না করলে এক্সেস বন্ধ (Auto Freeze) হওয়া।

---

## 8. 💸 CLIENT PAYMENTS (পেমেন্ট ট্র্যাকিং ও বণ্টন)

### 8.1 Payment Reception & Receipt Generation
* **8.1.1 Multi-Tender Entry:** নগদ, ব্যাংক, ক্রেডিট কার্ড বা চেকে পেমেন্ট গ্রহণ।
* **8.1.2 Receipt PDF Generation:** স্বয়ংক্রিয় অর্থ প্রাপ্তির রসিদ তৈরি ও ডাউনলোডের সুবিধা।

### 8.2 Payment Distribution Engine
* **8.2.1 Manual Payment Distribution:** জমাকৃত অর্থ কাস্টমারের পছন্দমতো নির্দিষ্ট একাধিক ইনভয়েসের অনুকূলে ভাগ করে দেওয়া।
* **8.2.2 Automated FIFO Credit Distribution:** কাস্টমারের জমা ক্রেডিট থেকে স্বয়ংক্রিয়ভাবে সবচেয়ে পুরোনো বকেয়া ইনভয়েস আগে পরিশোধ হওয়া।

### 8.3 Payment Adjustments & Reversals
* **8.3.1 Payment Edit & Reversal:** কোনো পেমেন্ট ভুল হলে তা এডিট বা রিভার্স করা (ইনভয়েসের বকেয়া পুনরায় বৃদ্ধি পাবে)।

---

## 9. ⚙️ CLIENT SETTINGS & CUSTOMIZATION (সেটিংস ও কাস্টমাইজেশন)

### 9.1 Custom Fields Builder Engine
* **9.1.1 Dynamic Field Creation:** টেক্সট ইনপুট, ড্রপডাউন, চেকডিটেক্ট বা তারিখের মতো নতুন ফিল্ড তৈরি করা।
* **9.1.2 Registration Form Integration:** তৈরি করা কাস্টম ফিল্ড কাস্টমার এন্ট্রি ফর্মে স্বয়ংক্রিয়ভাবে যুক্ত হওয়া।

### 9.2 Statuses & Pinned Status Builder
* **9.2.1 Custom Status Badges:** হাই-রিস্ক, ব্ল্যাকলিস্টেড, ভিআইপি বা সম্ভাব্য ক্রেতার ব্যাজ তৈরি।
* **9.2.2 Pinned Status Assignment:** প্রোফাইল হেডারে পিনড স্ট্যাটাস প্রদর্শন।

### 9.3 Dynamic Related Forms Builder
* **9.3.1 Related Form Builder:** ক্লায়েন্টের সাথে যুক্ত কাস্টম ফর্ম (যেমন: স্বাস্থ্য পরীক্ষা ফর্ম, সার্ভে ফর্ম) তৈরি।
* **9.3.2 Form Submissions Management:** পূরণকৃত ফর্মের ডাটা ফিল্টারিং, এডিটিং এবং রেকর্ড ট্র্যাকিং।

### 9.4 WhatsApp & Communication Settings
* **9.4.1 Gateway Credentials Setup:** WhatsApp API গেটওয়ে কী এবং অটো-টেমপ্লেট কনফিগারেশন।

---

## 10. 💾 MongoDB Schemas (Complete Mongoose Data Models)

```javascript
// models/CustomerSystemModels.js
const mongoose = require('mongoose');

// 1. Customer Main Schema
const CustomerSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  clientType: { type: String, enum: ['INDIVIDUAL', 'CORPORATE'], default: 'INDIVIDUAL' },
  name: { type: String, required: true },
  code: { type: String, unique: true },
  phone: { type: String, required: true },
  email: { type: String },
  photoUrl: { type: String },
  taxNumber: { type: String },
  crNumber: { type: String },
  Uakam_no: { type: String },
  
  // Addresses
  addresses: [{
    title: { type: String, default: 'Primary' },
    addressLine: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  
  // Group & Category
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientGroup' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCategory' },
  assignedPriceList: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Credit & Balances
  openingBalance: { type: Number, default: 0 },
  openingBalanceDate: { type: Date, default: Date.now },
  creditLimit: { type: Number, default: 0 },
  creditPeriodDays: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  
  // Statuses & Portal
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], default: 'ACTIVE' },
  pinnedStatus: String,
  portalAccess: { type: Boolean, default: false },
  portalUsername: String,
  portalPasswordHash: String,
  
  // Custom Fields & Dynamic Forms Data
  customFields: { type: Map, of: String }
}, { timestamps: true });

// 2. Client Payment Record Schema
const ClientPaymentSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  paymentNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'WALLET'], required: true },
  unallocatedAmount: { type: Number, default: 0 },
  allocations: [{
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    allocatedAmount: Number
  }],
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. Client Appointment / Followup Schema
const AppointmentSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  stage: { type: String, enum: ['PROSPECT', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] },
  appointmentDate: Date,
  durationMinutes: Number,
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  notes: String
}, { timestamps: true });

// 4. Client Attendance Schema
const ClientAttendanceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  checkInTime: { type: Date, default: Date.now },
  location: String,
  scannedMethod: { type: String, enum: ['BARCODE', 'QR', 'RFID', 'MANUAL'] }
}, { timestamps: true });

module.exports = {
  Customer: mongoose.model('Customer', CustomerSchema),
  ClientPayment: mongoose.model('ClientPayment', ClientPaymentSchema),
  Appointment: mongoose.model('Appointment', AppointmentSchema),
  ClientAttendance: mongoose.model('ClientAttendance', ClientAttendanceSchema)
};
```

---
