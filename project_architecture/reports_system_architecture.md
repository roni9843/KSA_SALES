# 📈 Reports & Analytics System Architecture & Functional Specification
## (রিপোর্ট ও এনালিটিক্স মডিউলের বিস্তারিত ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 💰 SALES REPORTS SUITE (বিক্রয় রিপোর্ট)

* **1.1 Sales by Item / Client / Staff:** পণ্য, ক্লায়েন্ট বা বিক্রয় প্রতিনিধি (Staff) অনুযায়ী বিক্রয়ের অর্থমূল্য, মোট ইউনিট এবং গ্রস প্রফিট।
* **1.2 Tax Summary Report:** সরকারি আয়কর/ভ্যাট রিটার্ন জমা দেওয়ার জন্য আউটপুট ভ্যাট কালেকশন রিপোর্ট।
* **1.3 Profit & Loss per Invoice:** প্রতিটি বিক্রয় ইনভয়েস ভিত্তিক সুনির্দিষ্ট মুনাফা বা ক্ষতির বিশ্লেষণ।

---

## 2. 🛒 PURCHASES REPORTS SUITE (পারচেজ রিপোর্ট)

* **2.1 Purchases by Supplier / Item:** সরবরাহকারী বা নির্দিষ্ট পণ্য ভিত্তিক ক্রয় হিসাব ও ট্রেন্ড।
* **2.2 Purchase Tax Reports:** ক্রয়ের বিপরীতে পরিশোধিত ইনপুট ভ্যাট (Input VAT Claimable) ট্যাক্স রিপোর্ট।

---

## 3. 📊 ACCOUNTING REPORTS SUITE (হিসাবরক্ষণ রিপোর্ট)

* **3.1 Income Statement / Profit & Loss (P&L):**
  $$\text{Net Income} = \text{Operating Revenue} - \text{COGS} - \text{Operating Expenses}$$
* **3.2 Balance Sheet (উদ্বর্তপত্র):**
  $$\text{Assets} = \text{Liabilities} + \text{Owner's Equity}$$
* **3.3 Trial Balance (রেওয়ামিল):** সমাপনী হিসাবসমূহের ডেবিট ও ক্রেডিটের সামঞ্জস্যতা রিপোর্ট।
* **3.4 General Ledger & Account Statements:** নির্দিষ্ট হিসাব খাতের বিস্তারিত ট্রানজ্যাকশন হিস্ট্রি ও খতিয়ান।

---

## 4. 📦 INVENTORY & STORE REPORTS (ইনভেন্টরি রিপোর্ট)

* **4.1 Stock Valuation Report:** Weighted Average Costিং পদ্ধতিতে মজুদের মোট বর্তমান আর্থিক মূল্য।
* **4.2 Inventory Movement Tracking:** গুদামে পণ্যের রিসিভ, ইসু, ইন-ট্রানজিট স্থানান্তরের ট্র্যাকিং।
* **4.3 Low Stock Alerts:** পুনর্ক্রয় সীমার নিচে (Below Reorder Level) নেমে যাওয়া পণ্যের সসংক্রান্ত অ্যালার্ট রিপোর্ট।

---

## 5. 🔍 SYSTEM ACTIVITY AUDIT LOG (অ্যাক্টিভিটি লগ)

* **5.1 User Actions Log Data:** ইউজার আইডি, কাজের ধরন (LOGIN, CREATE, UPDATE, DELETE), পরিবর্তিত ডাটার পূর্ববর্তী ও বর্তমান মান, টাইমস্ট্যাম্প ও আইপি এড্রেস ট্র্যাকিং।

---

## 6. 📂 OTHER SPECIALIZED REPORTS (অন্যান্য রিপোর্ট)

* **6.1 Employee Reports:** কর্মীর উপস্থিতি, ছুটির হিসেব এবং পে-স্লিপ ডাউনলোডের রিপোর্ট।
* **6.2 Cheques Report:** ইস্যু ও রিসিভকৃত চেকের স্ট্যাটাস (Pending, Cleared, Bounced) ও পোর্টফোলিও সামারি।
* **6.3 Clients & Points Reports:** গ্রাহকদের বাকি বাকি বয়স (Aging Report: 30/60/90 Days), জমানো ওয়ালেট ও লয়ালটি পয়েন্ট রিপোর্ট।
* **6.4 Rental Reports:** রেন্টাল এসেটের ব্যবহার সময়, মোট আয় এবং বর্তমান কন্ডিশন রিপোর্ট।

---
