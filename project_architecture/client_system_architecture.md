# 👥 Client & CRM System Architecture & Functional Specification
## (ক্লায়েন্ট ও সিআরএম মডিউলের বিস্তারিত প্রযুক্তিগত ও আর্কিটেকচারাল বিবরণী)

---

## 1. 🏗️ সিস্টেম সমীকরণ ও বর্তমান টেক-স্ট্যাক ডিজাইন (System Architecture Alignment)

বর্তমান প্রজেক্টের `backend/models/Customer.js` এবং `backend/routes/customer.js`-কে সম্প্রসারিত করে একটি সম্পূর্ণ ইন্টারপ্রাইজ-গ্রেড **Client & CRM System** তৈরি করার পূর্ণাঙ্গ প্রযুক্তিগত বিবরণ নিচে উপস্থাপন করা হলো।

* **কোডবেস টেক-স্ট্যাক:** Node.js (Express), Remote MongoDB (Mongoose ORM), React (Vite), Electron Desktop App.
* **প্রধান মডেলসমূহ:** `Customer`, `ClientPayment`, `ClientGroup`, `ClientCategory`, `ClientFollowup`, `ClientAttendance`, `Membership`, `RelatedForm`, `ClientActivityLog`.

---

## 2. 📋 ক্লায়েন্ট মডিউলের পয়েন্ট-বাই-পয়েন্ট বিস্তারিত বিবরণ (Exhaustive Point Breakdown)

---

### 2.1 🔷 MANAGE CLIENTS (ক্লায়েন্ট তৈরি, আমদানি ও মৌলিক ব্যবস্থাপনা)

#### 2.1.1 Enabling & Adding Opening Balance (ওপেনিং ব্যালেন্স ব্যবস্থাপনা)
* **2.1.1.1 Opening Balance for New Client:** নতুন ক্লায়েন্ট যোগ করার সময় প্রাথমিক ডেবিট (Debit - ক্লায়েন্টের পাওনা) বা ক্রেডিট (Credit - অগ্রিম জমা) এন্ট্রি দেওয়া।
* **2.1.1.2 Opening Balance for Registered Client:** ইতিমধ্যে নিবন্ধিত ক্লায়েন্টের প্রোফাইলে অ্যাকাউন্ট অপশন থেকে ওপেনিং ব্যালেন্স ও নির্দিষ্ট তারিখ (`openingBalanceDate`) আপডেট করা।
* **2.1.1.3 Ledger Accounting Entry:**
  * **Debit Opening Balance:** `Debit: Accounts Receivable (Customer)`, `Credit: Opening Balance Equity Account`.
  * **Credit Opening Balance:** `Debit: Opening Balance Equity Account`, `Credit: Customer Advance/Wallet Account`.

#### 2.1.2 Managing Client Groups & Categories (কাস্টমার গ্রুপ ও ক্যাটাগরি)
* **2.1.2.1 Client Groups Setup:** গ্রাহকদের ধরণ অনুযায়ী শ্রেণিবিভাগ (যেমন: Wholesale, Retail, Corporate, VIP).
* **2.1.2.2 Assigned Price List Engine:** নির্দিষ্ট গ্রুপকে একটি নির্দিষ্ট প্রাইস লিস্ট (Price List) বা ডিসকাউন্ট হারের সাথে যুক্ত করা (POS এ কাস্টমার সিলেক্ট করলে অটো প্রাইস চেঞ্জ হবে)।
* **2.1.2.3 Client Categories:** ভৌগোলিক অবস্থান বা ইন্ডাস্ট্রি টাইপ (যেমন: Local, International, Government) অনুযায়ী ক্যাটাগরি নির্ধারণ।

#### 2.1.3 Client Photo & File Custom Fields
* **2.1.3.1 Photo Upload:** কাস্টমার প্রোফাইলে ছবি বা লোগো আপলোড করা (Base64/Cloud storage URL)।
* **2.1.3.2 Custom Fields Support:** সিস্টেম সেটিং থেকে ক্লায়েন্ট ফাইলের সাথে অতিরিক্ত কাস্টম ফিল্ড (যেমন: National ID, Iqama No, License No) প্রদর্শন চালু করা।

#### 2.1.4 Importing Clients Data (বুল্ক ডাটা ইম্পোর্ট)
* **2.1.4.1 Excel / CSV Importer:** ফাইল আপলোড করে একবারে শত শত ক্লায়েন্ট ইম্পোর্ট করা।
* **2.1.4.2 Duplicate Validation:** ফোন নম্বর (`phone`), ইমেইল (`email`), অথবা ট্যাক্স আইডি (`taxNumber`) দিয়ে ডুপ্লিকেট এন্ট্রি ফিল্টার করে বাদ দেওয়া।

#### 2.1.5 Client List & Profile View
* **2.1.5.1 Master Directory:** ফিল্টারিং, সার্চিং (নাম, ফোন, ট্যাক্স আইডি), এবং পেজিনেশন সহ অল ক্লায়েন্ট লিস্ট।
* **2.1.5.2 Client Summary Header:** মোট কেনাকাটা (Total Revenue), বকেয়া (Outstanding Balance), জমা ক্রেডিট (Available Store Credit), এবং স্ট্যাটাস ব্যাজ (Active/Suspended)।

#### 2.1.6 Credit Limit & Credit Period Control
* **2.1.6.1 Credit Limit Amount:** কাস্টমারের সর্বোচ্চ বাকির সীমা নির্ধারণ (যেমন: 50,000 SAR)।
* **2.1.6.2 Credit Period Days:** বাকি পরিশোধের সর্বোচ্চ সময়সীমা (যেমন: 30 Days)।
* **2.1.6.3 Auto Block in POS:** লিমিট অতিক্রম করলে POS/Invoicing এ সিস্টেম বার্তা দিয়ে সেলস ব্লক করবে।

#### 2.1.7 Client Statement & Login Credentials
* **2.1.7.1 Account Statement (লেজার স্টেটমেন্ট):** নির্দিষ্ট তারিখের মধ্যে ইনভয়েস, পেমেন্ট, এবং রিটার্নের বিস্তারিত PDF রিপোর্ট তৈরি ও ইমেইল পাঠানো।
* **2.1.7.2 Send Portal Login Details:** কাস্টমার পোর্টালে লগইন করার ইউজারনেম ও পাসওয়ার্ড জেনারেট করে ইমেইল/এসএমএস পাঠানো।

#### 2.1.8 Client Activity Log (অডিট ট্রেইল)
* **2.1.8.1 Action Tracking:** কে, কখন কাস্টমারের প্রোফাইল পরিবর্তন করেছে, পেমেন্ট এড করেছে বা স্ট্যাটাস আপডেট করেছে তার অডিট লগ।

---

### 2.2 ⚙️ CLIENT OPERATIONS (ক্লায়েন্ট কার্যপ্রক্রিয়া ও অপশনসমূহ)

#### 2.2.1 Client Barcode Management
* **2.2.1.1 Creating Barcode:** কাস্টমার কোড বা আইডি থেকে Code128 / QR Code বারকোড জেনারেট করা।
* **2.2.1.2 Printing Barcode:** বারকোড থার্মাল প্রিন্টারে প্রিন্ট করে কাস্টমার আইডি কার্ডে লাগানোর উপযোগী করা।

#### 2.2.2 Quick Document Creation from Profile
* **2.2.2.1 Add Sales Order / Work Order:** কাস্টমার প্রোফাইল থেকে সরাসরি এক ক্লিকে নতুন সেলস অর্ডার বা জব কার্ড তৈরি।
* **2.2.2.2 Create Invoice / Estimate / Credit Note:** কাস্টমারের নাম ও ঠিকানা স্বয়ংক্রিয়ভাবে ইনপুট হয়ে ইনভয়েস স্ক্রিন ওপেন হওয়া।

#### 2.2.3 Multiple Addresses Management
* **2.2.3.1 Address Array Schema:** ক্লায়েন্টের একাধিক ডেলিভারি ও বিলিং এড্রেস যুক্ত করা।
* **2.2.3.2 Selection in Checkout:** ইনভয়েসিং বা ডেলিভারি চালানের সময় কাস্টমারের নির্দিষ্ট এড্রেস বেছে নেওয়া।

#### 2.2.4 Notes, Attachments & Printable Templates
* **2.2.4.1 Adding Notes & Files:** চুক্তিপত্র, ট্রেড লাইসেন্স বা জরুরি নোট আপলোড করে পিনড (Pinned Note) হিসেবে রাখা।
* **2.2.4.2 Client Printable:** প্রিন্ট ব্যাকগ্রাউন্ড ও কাস্টম টেমপ্লেট দিয়ে ক্লায়েন্টের প্রোফাইল প্রিন্ট করা।

#### 2.2.5 Communication Hub (SMS, Email & Direct WhatsApp)
* **2.2.5.1 Send Email & SMS:** সরাসরি কাস্টমার ফাইল থেকে টেমপ্লেট সিলেক্ট করে ইমেইল বা এসএমএস পাঠানো।
* **2.2.5.2 Direct WhatsApp Link:** কোনো থার্ড-পার্টি সার্ভিস ছাড়া সরাসরি কাস্টমারের নম্বরে ডাইরেক্ট ওয়াটসঅ্যাপ চ্যাট `https://wa.me/phone` ওপেন করা।

#### 2.2.6 Client Portal (গ্রাহক পোর্টাল)
* **2.2.6.1 Self-Service Access:** কাস্টমার নিজের ইউজারনেম দিয়ে লগইন করে বকেয়া ইনভয়েস দেখা, অনলাইনে বিল দেওয়া এবং আগের কোটেশন ডাউনলোড করা।

#### 2.2.7 Staff Assignment, Suspension & Deletion
* **2.2.7.1 Assigning Staff:** নির্দিষ্ট কাস্টমারের দায়িত্বে নির্দিষ্ট অ্যাকাউন্ট ম্যানেজার (Staff Member) নিয়োগ করা।
* **2.2.7.2 Suspending a Client:** কাস্টমার সাময়িকভাবে নিষ্ক্রিয় (Suspend) করা যাতে নতুন কোনো ইনভয়েস না হয়।
* **2.2.7.3 Deletion Safety Logic:** যদি কাস্টমারের নামে কোনো পূর্বের ইনভয়েস বা ট্রানজ্যাকশন থাকে, তবে হার্ড ডিলিট (Hard Delete) ব্লক হবে এবং সফ্ট ডিলিট (Archive) হবে।

---

### 2.3 🛠️ CLIENT SETTINGS & CUSTOMIZATION (ক্লায়েন্ট কাস্টমাইজেশন সেটআপ)

#### 2.3.1 WhatsApp Appointment Sending
* **2.3.1.1 API Configuration:** WhatsApp Business API বা Gateway সেটআপ করা।
* **2.3.1.2 Direct Appointment Reminders:** ক্লায়েন্টের অ্যাপয়েন্টমেন্ট শিডিউল হলে ওয়াটসঅ্যাপে অটোমেটিক কনফার্মেশন ও রিমাইন্ডার বার্তা পাঠানো।

#### 2.3.2 Client Permissions & Custom Statuses
* **2.3.2.1 Role-Based Visibility:** নির্দিষ্ট স্টাফ কোন কাস্টমারের ডাটা দেখতে পারবে তার পারমিশন সেটআপ।
* **2.3.2.2 Editing Statuses List:** কাস্টমার স্ট্যাটাস তৈরি (যেমন: New, VIP, Blacklisted, High Risk) এবং পিনড স্ট্যাটাস অ্যাসাইন করা।

#### 2.3.3 Related Forms Builder (সম্পর্কিত ফর্ম বিল্ডার)
* **2.3.3.1 Form Builder Engine:** কাস্টমারের থেকে অতিরিক্ত কোনো তথ্য নেওয়ার জন্য কাস্টম ফর্ম ফিল্ড জেনারেট করা।
* **2.3.3.2 Managing Form Records:** প্রোফাইলে ফর্ম সাবমিশনের হিস্ট্রি এডিট, ভিউ এবং ডিলিট করা।

---

### 2.4 💳 CLIENT PAYMENTS & CREDIT DISTRIBUTION (পেমেন্ট ও ক্রেডিট বণ্টন)

#### 2.4.1 Viewing Payment List & Receipts
* **2.4.1.1 Payment Audit Log:** কাস্টমারের এ যাবত প্রদানকৃত সমস্ত পেমেন্টের তালিকা এবং প্রতিটি পেমেন্টের প্রিন্ট রসিদ (Receipt PDF)।

#### 2.4.2 Adding Payment Credit (অ্যাডভান্স ওয়ালেট জমা)
* **2.4.2.1 Wallet Credit Topup:** ইনভয়েস ছাড়া সরাসরি কাস্টমার ওয়ালেটে অ্যাডভান্স টাকা জমা দেওয়া।
* **2.4.2.2 Accounting Post:** `Debit: Cash/Bank`, `Credit: Customer Wallet Liability`.

#### 2.4.3 Payment Distribution Engine (ইনভয়েস পেমেন্ট বণ্টন)
* **2.4.3.1 Manual Payment Distribution:** জমাকৃত বা নতুন প্রাপ্ত পেমেন্ট ম্যানুয়ালি সিলেক্ট করা নির্দিষ্ট ইনভয়েসগুলোতে বণ্টন (Distribute) করা।
* **2.4.3.2 Auto Distribution (FIFO Method):** জমাকৃত ক্রেডিট থেকে স্বয়ংক্রিয়ভাবে সবচেয়ে পুরোনো বকেয়া ইনভয়েস আগে পরিশোধ হওয়া।
* **2.4.3.3 Editing & Deleting Payments:** ভুল পেমেন্ট এন্ট্রি ডিলিট করলে ইনভয়েসের বকেয়া অ্যামাউন্ট পুনর্প্রতিষ্ঠিত হবে।

---

### 2.5 🔄 CLIENTS FOLLOW-UP (সিআরএম ফলো-আপ মডিউল)

* **2.5.1 CRM Pipeline:** Lead ➔ Contacted ➔ Proposal Sent ➔ Closed Won/Lost.
* **2.5.2 Interaction Log:** কল রেকর্ড, মিটিং নোটস এবং পরবর্তী ফলো-আপ তারিখের নোটিফিকেশন।

---

### 2.6 📅 CLIENTS ATTENDANCE (উপস্থিতি ট্র্যাকিং)

* **2.6.1 Access Pass Scan:** বারকোড/কিউআর স্ক্যান করে জিম, ক্লিনিক বা ক্লাব ক্লায়েন্টদের উপস্থিতি লগ রাখা।
* **2.6.2 Visit Count Limits:** সাবস্ক্রিপশন অনুযায়ী মোট ভিজিট সংখ্যা গণনা (যেমন: ১২টির মধ্যে ৫টি সম্পন্ন)।

---

### 2.7 🪙 POINTS & CREDITS (লয়ালটি ওয়ালেট)

* **2.7.1 Point Accrual Ledger:** কেনাকাটার ওপর অর্জিত পয়েন্ট এবং ক্যাশ ডিলিউশন হিসেব।
* **2.7.2 Refund to Store Credit:** ক্যাশ রিফান্ড না দিয়ে স্টোর ক্রেডিটে জমা করা।

---

### 2.8 🎟️ MEMBERSHIPS & SUBSCRIPTIONS (মেম্বারশিপ মডিউল)

* **2.8.1 Plan Creation:** মাসিক, দ্বিমাসিক বা বার্ষিক মেম্বারশিপ প্যাকেজ।
* **2.8.2 Expiration & Auto Freeze:** মেয়াদ শেষ হলে স্বয়ংক্রিয় এক্সেস ব্লক ও রিনিউ ইনভয়েস তৈরি।

---

## 3. 💾 MongoDB Schemas for Client System

```javascript
// models/Customer.js (Expanded Mongoose Schema)
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Primary' },
  addressLine: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: { type: Boolean, default: false }
});

const CustomerSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  code: { type: String, unique: true },
  phone: { type: String, required: true },
  email: { type: String },
  photoUrl: { type: String },
  taxNumber: { type: String },
  Uakam_no: { type: String },
  
  // Addresses
  addresses: [AddressSchema],
  
  // Group & Category & Pricing
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientGroup' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCategory' },
  assignedPriceList: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceList' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Financial & Credit Controls
  openingBalance: { type: Number, default: 0 },
  openingBalanceDate: { type: Date, default: Date.now },
  creditLimit: { type: Number, default: 0 },
  creditPeriodDays: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  
  // Statuses
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], default: 'ACTIVE' },
  pinnedStatus: { type: String },
  
  // Custom Fields & Notes
  customFields: { type: Map, of: String },
  notes: [{
    note: String,
    isPinned: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
```

---

> 💡 **নোট:** এই স্পেসিফিকেশন ডকুমেন্টটি আপনার ক্লায়েন্ট ও সিআরএম মডিউল কোডিংয়ের জন্য কম্প্রিহেনসিভ আর্কিটেকচার হিসেবে ব্যবহৃত হবে।
