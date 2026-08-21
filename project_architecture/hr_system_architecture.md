# 👨‍💼 HR & Payroll System Architecture & Functional Specification
## (মানবসম্পদ ও পে-রোল মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 👥 EMPLOYEE MANAGEMENT (কর্মী পরিচালনা)

### 1.1 Employee Profile & Master Directory
* **1.1.1 Personal & Bank Info:** কর্মীর পূর্ণ নাম, জাতীয় আইডি/ইকামা নম্বর, ফোন, ইমেইল, জরুরি কন্টাক্ট এবং বেতন ট্রান্সফারের ব্যাংক অ্যাকাউন্ট/IBAN তথ্য।
* **1.1.2 Joining, Contract & Probation:** যোগদানের তারিখ, চাকরির ধরন (Full-time, Part-time, Contractual), মূল বেতন (Basic Salary), ভাতা বিবরণী এবং প্রোভেশন পিরিয়ড স্ট্যাটাস।
* **1.1.3 Document Vault & Expiration Alerts:** আইডি, পাসপোর্ট বা ভিসার স্ক্যান কপি আপলোড এবং মেয়াদের শেষের ৩০/১৫ দিন পূর্বে অটোমেটিক নোটিফিকেশন সিস্টেম।

---

## 2. 🏢 ORGANIZATIONAL STRUCTURE (সাংগঠনিক কাঠামো)

### 2.1 Department & Designation Tree
* **2.1.1 Hierarchy Setup:** বিভাগ (যেমন: Sales, IT, Finance) এবং পদবি (যেমন: Manager, Executive) তৈরি করে অর্গানাইজেশনাল হায়ারার্কি ম্যাপিং করা।

### 2.2 Shift & Working Hours Setup
* **2.2.1 Shift Timings:** অফিস শুরূ ও শেষের সময়, লেট গ্রেস টাইম (যেমন: ১৫ মিনিট), উইকএন্ড ছুটির দিন এবং সাপ্তাহিক মোট কর্মঘণ্টা নির্ধারণ।

---

## 3. 🕒 ATTENDANCE & TIME TRACKING (হাজিরা ও সময় ট্র্যাকিং)

### 3.1 Attendance Data Logging
* **3.1.1 Multi-Source Attendance:** 
  * বায়োমেট্রিক ডিভাইস (ZKTeco API) ডাটা সরাসরি সিঙ্ক।
  * ESS মোবাইল অ্যাপে জিও-ফেন্সিং (GPS Coordinates Check) দিয়ে উপস্থিতি দেওয়া।
  * কাস্টম ম্যানুয়াল এন্ট্রি অপশন।

### 3.2 Time & Overtime Calculation Engine
* **3.2.1 Late & Early Exit Log:** বিলম্বে আগমন এবং নির্ধারিত সময়ের আগে প্রস্থান অটোমেটিক ট্র্যাক করা।
* **3.2.2 Overtime Calculation Formula:**
  $$\text{OT Amount} = \text{OT Hours} \times \left( \frac{\text{Basic Salary}}{208} \times 1.5 \right)$$

---

## 4. 🌴 LEAVE MANAGEMENT (ছুটি ব্যবস্থাপনা)

### 4.1 Leave Policies & Yearly Quotas
* **4.1.1 Leave Types:** বার্ষিক আকস্মিক ছুটি (Casual Leave), অসুস্থতাজনিত ছুটি (Sick Leave), এবং বাৎসরিক ছুটি (Annual Leave) এর জন্য কোটা সেটআপ।

### 4.2 Application & Approval Workflow
* **4.2.1 Leave Request Chain:** কর্মী কতৃক ছুটির আবেদন ➔ ডিপার্টমেন্ট হেড/ম্যানেজারের অনুমোদন ➔ ছুটি ব্যালেন্স থেকে অটো-বিয়োগ।

---

## 5. 💰 PAYROLL MANAGEMENT (পে-রোল ও বেতন)

### 5.1 Payslip Generation Engine
* **5.1.1 Net Salary Calculation Formula:**
  $$\text{Net Pay} = (\text{Basic} + \text{HRA} + \text{Transport} + \text{OT Pay}) - (\text{Unpaid Leave Deductions} + \text{Tax} + \text{Loan EMI} + \text{Penalties})$$

### 5.2 Employee Loans & Salary Advances
* **5.2.1 Loan EMI Auto-Deduction:** কর্মীদের অগ্রিম বেতন বা লোনের আবেদন এবং প্রতি মাসের পে-স্লিপ থেকে নির্ধারিত কিস্তি (EMI) স্বয়ংক্রিয়ভাবে কর্তন হওয়া।

### 5.3 Salary Payout & WPS Bank Export
* **5.3.1 Payout Execution:** ক্যাশ বা ব্যাংক ট্রান্সফারের মাধ্যমে বেতন পরিশোধের ভাউচার তৈরি এবং সৌদি আরব WPS (Wage Protection System) ফাইল এক্সপোর্ট।

---

## 6. 📱 EMPLOYEE SELF-SERVICE - ESS PORTAL (ইএসএস পোর্টাল)

### 6.1 Employee Portal Access
* **6.1.1 Self-Service Login:** কর্মীদের জন্য আলাদা লগইন ইউজারনেম ও পাসওয়ার্ড প্রদান।

### 6.2 Self-Service Request Submission
* **6.2.1 Employee Self Action:** মোবাইল অ্যাপ বা পোর্টাল থেকে ছুটির আবেদন, খরচের বিল ফেরত (Reimbursement) দাবি, এবং নিজস্ব পে-স্লিপ ডাউনলোড।

---

## 7. 💾 MongoDB Schemas for HR System

```javascript
// models/HrSystemModels.js
const mongoose = require('mongoose');

// 1. Employee Schema
const EmployeeSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  employeeCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  department: String,
  designation: String,
  joiningDate: Date,
  basicSalary: { type: Number, required: true },
  allowances: {
    hra: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  bankDetails: {
    bankName: String,
    iban: String
  },
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE' }
}, { timestamps: true });

// 2. Payslip Schema
const PayslipSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // e.g. '2026-08'
  basicSalary: Number,
  totalAllowances: Number,
  overtimePay: Number,
  totalDeductions: Number,
  netSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' }
}, { timestamps: true });

module.exports = {
  Employee: mongoose.model('Employee', EmployeeSchema),
  Payslip: mongoose.model('Payslip', PayslipSchema)
};
```
