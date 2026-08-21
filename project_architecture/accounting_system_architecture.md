# 📊 Accounting System Architecture & Functional Specification
## (হিসাবরক্ষণ মডিউলের পূর্ণাঙ্গ ৪-লেভেল প্রযুক্তিগত ও আর্থিক বিবরণী)

---

## 1. 🌲 CHART OF ACCOUNTS (চার্ট অব অ্যাকাউন্টস)

### 1.1 Hierarchical Account Tree Structure
* **1.1.1 5 Core Financial Categories:**
  * **1. Assets (সম্পদ):** Current Assets, Cash, Bank, Accounts Receivable, Inventory, Fixed Assets.
  * **2. Liabilities (দেনা):** Current Liabilities, Accounts Payable, Tax Output Payable, Customer Advances, Loans.
  * **3. Equity (মালিকানা স্বত্ব):** Owner Capital, Retained Earnings, Opening Balance Equity.
  * **4. Income / Revenue (আয়):** Sales Revenue, Service Fees, Interest Income, Other Income.
  * **5. Expenses (ব্যয়):** Cost of Goods Sold (COGS), Salaries, Rent, Utilities, Depreciation.

### 1.2 Custom Sub-Accounts & Code Format
* **1.2.1 Account Code Structure:** ৫-সংখ্যার স্ট্যান্ডার্ড অ্যাকাউন্ট কোডিং প্যাটার্ন:
  * `10000-19999`: Assets (e.g., `11010` Petty Cash, `11020` City Bank Account)
  * `20000-29999`: Liabilities (e.g., `21010` Trade Payables, `21050` VAT Output Tax)
  * `30000-39999`: Equity (e.g., `31010` Owner's Capital)
  * `40000-49999`: Income (e.g., `41010` Product Sales Revenue)
  * `50000-59999`: Expenses (e.g., `51010` Rent Expense, `51020` Salary Expense)

---

## 2. 📝 JOURNAL ENTRIES (জার্নাল এন্ট্রি)

### 2.1 Manual Journal Vouchers (JV)
* **2.1.1 Double-Entry Balancing Rule:**
  * প্রতিটি জার্নাল ভাউচারে কমপক্ষে ২টি এন্ট্রি থাকবে এবং ডেবিট ও ক্রেডিটের সমষ্টি অবশ্যই সমান হতে হবে:
    $$\sum \text{Debits} = \sum \text{Credits}$$
* **2.1.2 JV Workflow:** এন্ট্রি দিন ➔ রেফারেন্স নোট ও নথি যুক্ত করুন ➔ অ্যাকাউন্ট্যান্ট রিভিউ ➔ পোস্টিং।

### 2.2 Automated Transaction Postings Matrix
* **2.2.1 Auto-Posting Triggers:**
  * **Sales Invoice:** `Debit: Accounts Receivable`, `Credit: Sales Revenue`, `Credit: VAT Payable`.
  * **Supplier Payment:** `Debit: Accounts Payable`, `Credit: Cash/Bank`.
  * **Payroll Run:** `Debit: Salary Expense`, `Credit: Salary Payable / Bank`.

---

## 3. 💸 EXPENSE MANAGEMENT (খরচ ব্যবস্থাপনা)

### 3.1 New Expense Entry
* **3.1.1 Entry Fields:** খরচের বিভাগ (Expense Category), প্রদানকৃত অর্থ, ভ্যাট %, পেমেন্ট মাধ্যম (Cash/Bank) এবং ভেন্ডর ইনফো।
* **3.1.2 Accounting Post:**
  * `Debit: Relevant Expense Account`
  * `Debit: Input VAT Claimable Account`
  * `Credit: Cash / Bank Account`

### 3.2 Recurring Expense Automation
* **3.2.1 Scheduled Expenses:** অফিস ভাড়া, ইন্টারনেট বিল ইত্যাদির জন্য নির্দিষ্ট তারিখ বা মাসে স্বয়ংসক্রিয় এক্সপেন্স ভাউচার জেনারেট হওয়া।

### 3.3 Receipt Attachment & OCR Integration
* **3.3.1 Receipt Scanner:** খরচের মেমো বা রসিদের ছবি আপলোড করা এবং OCR প্রযুক্তির মাধ্যমে মূল্য ও তারিখ স্বয়ংক্রিয় এক্সট্রাক্ট করা।

---

## 4. 🏢 FIXED ASSETS & DEPRECIATION (সম্পদ ও অবচয়)

### 4.1 Fixed Asset Registry
* **4.1.1 Asset Master Fields:** সম্পদের নাম, ক্রয়ের তারিখ, ক্রয়মূল্য, আনুমানিক আয়ুষ্কাল (Useful Life Years), এবং স্ক্র্যাপ ভ্যালু (Salvage Value)।

### 4.2 Automated Depreciation Engine
* **4.2.1 Straight-Line Depreciation Formula:**
  $$\text{Monthly Depreciation} = \frac{\text{Acquisition Cost} - \text{Salvage Value}}{\text{Useful Life (Months)}}$$
* **4.2.2 Monthly Journal Post:** মাস শেষে স্বয়ংসক্রিয় অবচয় ভাউচার তৈরি:
  * `Debit: Depreciation Expense Account`
  * `Credit: Accumulated Depreciation (Contra-Asset)`

---

## 5. 🏦 CHEQUE CYCLE MANAGEMENT (চেক ট্র্যাকিং)

### 5.1 Issued Cheques Lifecycle (প্রদানকৃত চেক)
* **5.1.1 Status Pipeline:**
  1. `Issued (Pending):` `Debit: Accounts Payable`, `Credit: Cheque Payable (Liability)`.
  2. `Cleared:` `Debit: Cheque Payable`, `Credit: Bank Account`.
  3. `Bounced:` `Debit: Cheque Payable`, `Credit: Accounts Payable` + Bounced Penalty Entry.

### 5.2 Received Cheques Lifecycle (প্রাপ্ত চেক)
* **5.2.1 Status Pipeline:**
  1. `Received:` `Debit: Cheque in Hand (Asset)`, `Credit: Accounts Receivable`.
  2. `Under Collection:` `Debit: Cheque Clearing Account`, `Credit: Cheque in Hand`.
  3. `Cleared:` `Debit: Bank Account`, `Credit: Cheque Clearing Account`.
  4. `Bounced:` `Debit: Accounts Receivable`, `Credit: Cheque Clearing Account`.

---

## 6. 📈 FINANCIAL REPORTING ENGINE (আর্থিক রিপোর্ট)

### 6.1 Core Financial Statements
* **6.1.1 Profit & Loss Statement (P&L):**
  $$\text{Net Profit} = \text{Operating Revenue} - \text{COGS} - \text{Operating Expenses}$$
* **6.1.2 Balance Sheet:**
  $$\text{Total Assets} = \text{Total Liabilities} + \text{Owner's Equity}$$
* **6.1.3 Trial Balance:** সমস্ত লেজার অ্যাকাউন্টসমূহের সমাপনী ডেবিট ও ক্রেডিট সামঞ্জস্যতা পরীক্ষা।

### 6.2 Ledger & Tax Summary Reports
* **6.2.1 General Ledger & Tax Return:** লেজার ভিত্তিক স্টেটমেন্ট তৈরি এবং সরকারি আয়কর/ভ্যাট রিটার্ন প্রস্তুতের জন্য ইনপুট-আউটপুট ভ্যাট সামারি।

---

## 7. 💾 MongoDB Schemas for Accounting System

```javascript
// models/AccountingSystemModels.js
const mongoose = require('mongoose');

// 1. Chart of Accounts Schema
const AccountSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  category: { type: String, enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'], required: true },
  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Journal Entry Schema
const JournalEntrySchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  voucherNumber: { type: String, required: true, unique: true },
  entryDate: { type: Date, default: Date.now },
  reference: String,
  description: String,
  lines: [{
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    memo: String
  }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = {
  Account: mongoose.model('Account', AccountSchema),
  JournalEntry: mongoose.model('JournalEntry', JournalEntrySchema)
};
```
