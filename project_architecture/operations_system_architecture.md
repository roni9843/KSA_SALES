# ⚙️ Operations System Architecture & Functional Specification
## (অপারেশনস ও সার্ভিসেস মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 🛠️ WORK ORDERS (ওয়ার্ক অর্ডার বা জব কার্ড)

### 1.1 Work Order Creation & Assignment
* **1.1.1 Job Card Entry:** কাস্টমারের তথ্য, ডিভাইসের ধরণ, ত্রুটি বিবরণী ও আনুমানিক খরচ দিয়ে নতুন ওয়ার্ক অর্ডার তৈরি।
* **1.1.2 Technician Allocation:** কাজের জন্য নির্দিষ্ট টেকনিশিয়ান বা সার্ভিস টিম সদস্য অ্যাসাইন করা।

### 1.2 Status Lifecycle & Material Deduction
* **1.2.1 Pipeline Stages:** `In-Progress` ➔ `Waiting for Parts` ➔ `Quality Check` ➔ `Completed`.
* **1.2.2 Spare Parts Deduction:** মেরামত করতে গিয়ে ইনভেন্টরি থেকে ব্যবহৃত খুচরা যন্ত্রাংশ ওয়ার্ক অর্ডারে যুক্ত করা এবং স্টক স্বয়ংক্রিয়ভাবে কমিয়ে দেওয়া।

---

## 2. 📅 BOOKINGS & RESERVATIONS (বুকিং ও শিডিউলিং)

### 2.1 Resource & Service Setup
* **2.1.1 Service Items:** ডাক্তার কনসালটেন্সি, সেলুন সেবাসমূহ, ডাইনিং টেবিল বা স্পোর্টস গ্রাউন্ড বুকিং ক্যাটাগরি তৈরি।

### 2.2 Interactive Calendar & Slot Booking
* **2.2.1 Time Slot Allocation Grid:** ড্যাশবোর্ডে সময় স্লট এবং খালি টেবিল/রিসোর্স দেখে বুকিং কনফার্ম করা।
* **2.2.2 Online Self-Booking:** কাস্টমার ওয়েব লিংক থেকে ফাঁকা তারিখ ও সময় বেছে নিয়ে বুকিং সম্পন্ন করতে পারবে।

---

## 3. 🚗 RENTAL & UNIT MANAGEMENT (রেন্টাল ও ইউনিট ব্যবস্থাপনা)

### 3.1 Rental Property / Asset Unit Registry
* **3.1.1 Property/Vehicle Setup:** রুম নম্বর, ফ্ল্যাট নাম্বার বা গাড়ি নিবন্ধন নম্বর, মডেল ও কন্ডিশন সেটআপ।

### 3.2 Check-in, Check-out & Usage Billing
* **3.2.1 Rental Contract Workflow:** চেক-ইন তারিখ, কাস্টমার আইডেন্টিটি, চেক-আউট তারিখ এবং সিকিউরিটি ডিপোজিট এন্ট্রি।
* **3.2.2 Usage Meter Billing Formula:**
  $$\text{Rental Bill} = \text{Fixed Base Rent} + \left( (\text{End Meter/KM} - \text{Start Meter/KM}) \times \text{Per KM Rate} \right)$$

---

## 4. ⏱️ TIME TRACKING & TIMESHEETS (টাইম ট্র্যাকিং)

### 4.1 Log Billable Hours per Task
* **4.1.1 Task Timer Logging:** প্রজেক্ট বা কাজের বিপরীতে ঘন্টা বা মিনিট হিসেবে কর্মীর কাজের সময় হিসাব রাখা (Billable vs Non-Billable Hours)।

### 4.2 Automated Timesheet-to-Invoice Conversion
* **4.2.1 Invoicing Formula:**
  $$\text{Invoice Total} = \text{Logged Billable Hours} \times \text{Hourly Rate}$$
* **4.2.2 Direct Billing:** টাইমশিটের তথ্য থেকে এক ক্লিকে সরাসরি কাস্টমার সেলস ইনভয়েস তৈরি করা।

---

## 5. 💾 MongoDB Schemas for Operations System

```javascript
// models/OperationsSystemModels.js
const mongoose = require('mongoose');

// 1. Work Order Schema
const WorkOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  workOrderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemDescription: String,
  reportedIssue: String,
  usedParts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    unitPrice: Number
  }],
  laborCharge: { type: Number, default: 0 },
  status: { type: String, enum: ['IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED'], default: 'IN_PROGRESS' }
}, { timestamps: true });

module.exports = {
  WorkOrder: mongoose.model('WorkOrder', WorkOrderSchema)
};
```
