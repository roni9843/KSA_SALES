# Enterprise ERP & Multi-Industry POS System Specification
## (লজিক ও সাব-পয়েন্ট ভিত্তিক পূর্ণাঙ্গ প্রযুক্তিগত ও ব্যবসায়িক বিবরণী)

---

## 1. 🏗️ SYSTEM ARCHITECTURE & DATA SYNCHRONIZATION LOGIC

### 1.1 Hybrid Desktop-Cloud Architecture
* **1.1.1 Electron Desktop Client Engine:**
  * **1.1.1.1 Local Data Persistence:** SQLite ডাটাবেস ব্যবহার করে স্থানীয়ভাবে লেনদেন সংরক্ষণ।
  * **1.1.1.2 IPC Bridge Security:** Renderer (React) এবং Main (Node.js/Electron) প্রসেসের মধ্যে `contextBridge` দিয়ে নিরাপদ যোগাযোগ।
  * **1.1.1.3 Hardware Driver Bus:** থার্মাল প্রিন্টার (ESC/POS), স্ক্যানার, ক্যাশ ড্রয়ার এবং ওজনের স্কেলের সাথে সরাসরি পোর্টের সংযোগ।
* **1.2.1 Remote Cloud Backend API:**
  * **1.2.1.1 Tech Stack:** Node.js, Express.js framework এবং Mongoose (Remote MongoDB Atlas)।
  * **1.2.1.2 Security & Authentication:** JWT (JSON Web Token) সাথে Refresh Token রিট্রিভাল এবং IP/Device binding।
  * **1.2.1.3 Multi-Tenant Isolation:** প্রতি ক্যোয়ারীতে `merchantId` ফিল্টারিং এবং রোল-ভিত্তিক ডাটা এক্সেস।
* **1.3.1 Offline-First Sync Protocol:**
  * **1.3.1.1 Sync Queue Manager:** লোকাল SQLite-এ `sync_status: 'PENDING'` যুক্ত সমস্ত রেকর্ড অফলাইন ট্র্যাকিং।
  * **1.3.1.2 Conflict Resolution:** Server Timestamp Preference + Client Transaction Replay Log।
  * **1.3.1.3 Idempotency Key Engine:** ডুপ্লিকেট ইনভয়েস ঠেকানোর জন্য `idempotency_key` জেনারেশন।

---

## 2. 📋 EXHAUSTIVE MODULE SPECIFICATIONS (3-LEVEL HIERARCHY WITH BUSINESS LOGIC)

---

### 2.1 💰 SALES & E-INVOICING (বিক্রয় ও ইলেকট্রনিক ইনভয়েসিং)

#### 2.1.1 Invoices and Estimates
* **2.1.1.1 Quotation / Estimate Management:**
  * **Inputs:** Customer ID, Valid Until Date, Product Items (SKU, Qty, Unit Price, Line Discount %, Line VAT %).
  * **Calculation Rules:** $\text{Line Net} = (\text{Qty} \times \text{Unit Price}) - \text{Discount}$, $\text{VAT} = \text{Line Net} \times \text{VAT Rate}$.
  * **Workflow:** Draft ➔ Sent to Client ➔ Approved ➔ Converted to Invoice.
* **2.1.1.2 Estimate-to-Invoice Conversion:**
  * **Logic:** কোটেশন এপ্রুভ হলে এক ক্লিকে একই ডাটা ইনভয়েস স্কিমায় কপি হবে এবং কোটেশন স্ট্যাটাস `CONVERTED` লক হবে।
* **2.1.1.3 Recurring Invoices:**
  * **Cron Trigger:** দৈনিক ব্যাকগ্রাউন্ড কাজ যা নির্ধারিত মেয়াদে (Monthly/Yearly) নতুন ইনভয়েস জেনারেট করে।
  * **Notification:** গ্রাহকের ইমেইল ও হোয়াটসঅ্যাপে স্বয়ংক্রিয় পে-লিংক পাঠানো।
* **2.1.1.4 Pro-Forma & Credit/Debit Notes:**
  * **Pro-Forma Invoice:** অফিশিয়াল ইনভয়েসের পূর্বে পেমেন্ট গ্যারান্টির জন্য দেওয়া রসিদ।
  * **Credit Note (Sales Return):** পণ্য ফেরত আসলে ইনভেন্টরিতে স্টক পুনঃসংযোজন এবং কাস্টমার লেজারে স্বয়ংক্রিয় জার্নাল:
    * `Debit: Sales Returns Account`
    * `Debit: Output VAT Account`
    * `Credit: Accounts Receivable / Customer Wallet`

#### 2.1.2 Advanced Payments
* **2.1.2.1 Customer Advance Receipts:**
  * **Accounting Hook:** ইনভয়েস ছাড়া টাকা জমা নেওয়ার লজিক:
    * `Debit: Cash / Bank Account`
    * `Credit: Customer Advance Payments (Liability)`
* **2.1.2.2 Advance Allocation Engine:**
  * **Logic:** নতুন ইনভয়েস তৈরি হলে অ্যাডভান্সের অবশিষ্টাংশ থেকে ইনভয়েস অ্যামাউন্ট মাইনাস হবে:
    * `Debit: Customer Advance Payments`
    * `Credit: Accounts Receivable`
* **2.1.2.3 Advance Refund:**
  * **Workflow:** অব্যবহৃত জমা টাকা কাস্টমারকে ফেরত দেওয়ার পে-আউট ভাউচার জেনারেট করা।

#### 2.1.3 Point of Sales (POS)
* **2.1.3.1 High-Speed Cashier Interface:**
  * **Keyboard Shortcuts:** F1 (Search), F2 (Pay), F4 (Hold), F8 (Discount), F10 (Print).
  * **Scanner Auto-Focus:** স্ক্যানারের বারকোড পড়া মাত্র সাথে সাথে কার্টে Qty +1 বৃদ্ধি এবং পপ-আপ সাউন্ড।
* **2.1.3.2 Split Payment & Multi-Tender Logic:**
  * **Rule:** একটি ইনভয়েসের বিল একাধিক মাধ্যমে বিভাজন:
    * $\text{Total Bill} = \text{Cash Paid} + \text{Card Paid} + \text{Credit/Wallet}$.
  * **Change Calculation:** $\text{Change Amount} = \text{Tendered Cash} - \text{Cash Portion}$.
* **2.1.3.3 Cart Hold & Resume:**
  * **State Management:** বর্তমান কার্ট লোকাল স্টোরেজে `hold_id` সহ সেভ করে রাখা এবং নতুন কাস্টমারের বিল নেওয়া।
* **2.1.3.4 Hardware Integration Drivers:**
  * **Thermal Printing:** ESC/POS কমান্ড বাফার জেনারেট করা (80mm/58mm)।
  * **Cash Drawer Trigger:** প্রিন্টারে পোর্টেবল ইলেকট্রিক পালস পাঠানো (`0x1B, 0x70, 0x00, 0x19, 0xFA`) ক্যাশ ড্রয়ার খোলার জন্য।

#### 2.1.4 Installments (কিস্তি ভিত্তিক বিক্রয়)
* **2.1.4.1 Down Payment & Principal Allocation:**
  * **Formula:** $\text{Principal Loan} = \text{Grand Total} - \text{Down Payment}$.
* **2.1.4.2 Interest Calculation Models:**
  * **Flat Rate Interest:** $\text{Total Interest} = \text{Principal} \times \text{Rate} \times \text{Tenure (Years)}$.
  * **Reducing Balance Model:** প্রতি মাসের আসল কমার পর অবশিষ্ট আসলের ওপর সুদ গণনা।
* **2.1.4.3 Repayment Schedule Generator:**
  * **Output:** কিস্তির সংখ্যা (N), প্রতি মাসের নির্দিষ্ট পরিশোধের তারিখ, আসল এবং সুদের আলাদা হিসাবের তালিকা।
* **2.1.4.4 Late Penalty & Overdue Rules:**
  * **Grace Period:** মেয়াদ শেষের পর $G$ দিন ছাড়।
  * **Penalty Engine:** $G$ দিন অতিক্রম করলে প্রতি দিনের জন্য নির্দিষ্ট ফি বা % হারে পেনাল্টি জমা হওয়া।

#### 2.1.5 Sales Target & Commissions
* **2.1.5.1 Target Metrics Engine:**
  * **Metrics:** বিক্রয় পরিমাণ (Volume/Quantity) অথবা বিক্রয় অর্থমূল্য (Revenue) অনুযায়ী এজেন্টভিত্তিক মাসিক টার্গেট।
* **2.1.5.2 Commission Calculation Formulas:**
  * **Gross Sales Commission:** $\text{Commission} = \text{Total Sales} \times \text{Commission \%}$.
  * **Profit Margin Commission:** $\text{Commission} = (\text{Selling Price} - \text{Cost Price}) \times \text{Commission \%}$.
  * **Tiered Commission Rules:** 
    * 0 - $10,000 SAR = 2%
    * $10,001 - $50,000 SAR = 5%
    * $50,000+ SAR = 8%
* **2.1.5.3 Commission Ledger & Payout:**
  * **Journal Voucher:**
    * `Debit: Sales Commission Expense`
    * `Credit: Commission Payable to Agent`

#### 2.1.6 Shop Front & Digital Catalog
* **2.1.6.1 Real-Time Catalog Sync:**
  * **Logic:** গুদামের স্টক `stock_quantity > 0` হলে ডিজিটাল ক্যাটালগে অটো-শো করবে।
* **2.1.6.2 Self-Checkout Orders:**
  * **Workflow:** কাস্টমারের অনলাইন অর্ডার সরাসরি POS অ্যাপের "Incoming Orders" নোটিফিকেশনে জমা হওয়া।

#### 2.1.7 Loyalty Points System
* **2.1.7.1 Point Accrual Engine:**
  * **Formula:** $\text{Earned Points} = \lfloor \frac{\text{Net Invoice Total}}{\text{Spend Unit Rate}} \rfloor \times \text{Points Per Unit}$.
* **2.1.7.2 Point Redemption Logic:**
  * **Formula:** $\text{Discount Value} = \text{Redeemed Points} \times \text{Point Cash Value}$.
* **2.1.7.3 Expiry & Tier Upgrades:**
  * **Tier Levels:** Bronze (0-500 pts), Silver (501-2000 pts), Gold (2001+ pts)।
  * **Expiry:** নির্দিষ্ট মাস পর অব্যবহৃত পয়েন্ট বাতিল করার ক্রোন জব।

#### 2.1.8 Insurance Agents
* **2.1.8.1 Agent Policy Mapping:**
  * **Data:** ইনভয়েসের সাথে Policy Number, Insurance Company ID এবং Agent ID লিংক করা।
* **2.1.8.2 Co-Pay Splitting Rule:**
  * **Formula:** $\text{Patient Pay} = \text{Total} \times \text{Co-Pay \%}$, $\text{Insurance Claim} = \text{Total} \times (100\% - \text{Co-Pay \%})$.

#### 2.1.9 Multi-Country E-Invoicing Engine (ZATCA Saudi Arabia & Regional)
* **2.1.9.1 ZATCA Mandatory Invoice Data Fields:**
  * UUID (v4), Invoice Counter (ICV), Cryptographic Stamp, Previous Invoice Hash (SHA256 Chaining).
* **2.1.9.2 QR Code TLV (Tag-Length-Value) Base64 Encoding:**
  * **Tag 1:** Seller Name
  * **Tag 2:** VAT Registration Number
  * **Tag 3:** Timestamp (ISO 8601 UTC)
  * **Tag 4:** Invoice Total (with VAT)
  * **Tag 5:** VAT Total
  * **Tag 6:** ECDSA SHA256 Hash of Invoice XML
  * **Tag 7:** ECDSA Digital Signature
  * **Tag 8:** ECDSA Public Key
  * **Tag 9:** ECDSA Stamp Certificate Signature
* **2.1.9.3 ZATCA Clearance & Reporting API Payload:**
  * **Standard (B2B):** UBL 2.1 XML ফরম্যাট তৈরি করে ZATCA Portal এ **Clearance API** এ পাঠানো।
  * **Simplified (B2C):** ইনভয়েস তৈরি হওয়ার সাথে সাথে স্থানীয়ভাবে QR কোড প্রিন্ট করা এবং ২৪ ঘণ্টার মধ্যে ZATCA **Reporting API** তে জমা দেওয়া।

---

### 2.2 👥 CLIENTS & CRM (গ্রাহক ও সিআরএম মডিউল)

#### 2.2.1 Client Master & Credit Limit Engine
* **2.2.1.1 Master Data Fields:** Client Name, Tax Registration No, Phone, Email, Billing Address, Credit Limit Amount, Payment Term Days.
* **2.2.1.2 Credit Limit Check Logic:**
  * **Condition:** $\text{Current Balance} + \text{New Invoice Amount} > \text{Credit Limit}$.
  * **Action:** সিস্টেম ইনভয়েস সাবমিট করা ব্লক করবে এবং ম্যানেজারের Over-ride PIN চাইবে।

#### 2.2.2 Client Follow-up & CRM Pipeline
* **2.2.2.1 Lead Stages:** New Lead ➔ Qualified ➔ Proposal Sent ➔ Negotiating ➔ Won / Lost.
* **2.2.2.2 Follow-up Reminders:** নির্দিষ্ট তারিখে এসএমএস/ইমেইল অ্যালার্ট এবং সেলস টিমের ড্যাশবোর্ডে নোটিফিকেশন।

#### 2.2.3 Client Attendance & Access Control
* **2.2.3.1 Gate Pass Scan:** কিউআর/আরএফআইডি স্ক্যান করলে গ্রাহকের মেম্বারশিপ ভ্যালিডিটি চেক করা এবং এক্সেস দেওয়া।

#### 2.2.4 Store Credits & Wallet
* **2.2.4.1 Credit Deposit & Refund Logic:**
  * **Deposit:** `Debit: Cash, Credit: Customer Wallet Balance`.
  * **Purchase Deduction:** `Debit: Customer Wallet Balance, Credit: Sales Revenue`.

#### 2.2.5 Memberships & Subscriptions
* **2.2.5.1 Billing Automation:** মেম্বারশিপের শেষ দিন অটোমেটিক রিনিউয়াল ইনভয়েস তৈরি এবং ইমেইলে নোটিফিকেশন।

---

### 2.3 📦 INVENTORY & WAREHOUSES (ইনভেন্টরি ও গুদাম ব্যবস্থাপনা)

#### 2.3.1 Multi-Warehouse & Location Mapping
* **2.3.1.1 Bin/Rack Hierarchy:** Warehouse ➔ Zone ➔ Aisle ➔ Rack ➔ Bin Location.
* **2.3.1.2 Inter-Warehouse Stock Transfer:**
  * **Workflow:** Dispatch from Source ➔ In-Transit Stock ➔ Received at Destination.

#### 2.3.2 Requisitions (পণ্য চাহিদা পত্র)
* **2.3.2.1 Approval Chain:** Branch Requisition ➔ Inventory Manager Approval ➔ Stock Transfer Voucher.

#### 2.3.3 Stocktakings (স্টক অডিট ও গণনা)
* **2.3.3.1 Variance Logic:** $\text{Variance} = \text{Physical Count} - \text{System Expected Count}$.
* **2.3.3.2 Stock Adjustment Journal:**
  * **Gain ($\text{Variance} > 0$):** `Debit: Inventory, Credit: Stock Adjustment Gain Account`.
  * **Loss ($\text{Variance} < 0$):** `Debit: Stock Adjustment Loss Account, Credit: Inventory`.

#### 2.3.4 Products & Unit Conversion Templates
* **2.3.4.1 Unit Matrix:** 
  * Base Unit: Piece (PCS)
  * Multiplier: 1 Box = 12 PCS, 1 Carton = 10 Boxes (120 PCS).
* **2.3.4.2 Automatic Unit Reduction:** ইনভয়েসে "১ কার্টন" সিলেক্ট করলে স্টকে ১২০ পিস কমবে।

#### 2.3.5 Price Lists (প্রাইস লিস্ট)
* **2.3.5.1 Tier Pricing Engine:** 
  * Wholesale Price, Retail Price, Distributor Price.
  * কাস্টমার প্রোফাইলে নির্ধারিত প্রাইস লিস্ট অনুযায়ী POS অটোমেটিক রেট বসাবে।

#### 2.3.6 Bundle Products (কম্বো প্যাক)
* **2.3.6.1 Component Consumption Rules:** বান্ডিল আইটেম বিক্রি হলে বান্ডিলের অন্তর্ভুক্ত প্রতি কাঁচামাল/পণ্যের পরিমাণ অনুযায়ী মূল গুদাম থেকে স্টক কমবে।
* **2.3.6.2 Weakest Link Availability:** বান্ডিলের প্রাপ্যতা নির্ভর করবে সর্বনিম্ন স্টকে থাকা উপাদানের ওপর:
  * $\text{Available Bundles} = \min \left( \lfloor \frac{\text{Stock}_i}{\text{Required}_i} \rfloor \right)$.

#### 2.3.7 Product Tracking (সিরিয়াল, ব্যাচ ও এক্সপায়ারি)
* **2.3.7.1 FEFO Engine (First Expired, First Out):** যে ব্যাচের মেয়াদের তারিখ সবার আগে শেষ হবে, POS স্বয়ংক্রিয়ভাবে সেই ব্যাচটি বিক্রয়ের জন্য সাজেস্ট করবে।
* **2.3.7.2 IMEI/Serial Tracking:** প্রতি ইউনিটের আলাদা সিরিয়াল নম্বর ইনপুট এবং সেলস ইনভয়েসের সাথে ওয়ারেন্টি মেয়াদের ট্র্যাকিং।

---

### 2.4 🏭 MANUFACTURING & PRODUCTION (উৎপাদন মডিউল)

#### 2.4.1 Bill of Materials (BOM) & Costing
* **2.4.1.1 Raw Material Recipe:** ১ ইউনিট ফিনিশড প্রোডাক্ট তৈরি করতে প্রতি কাঁচামালের অনুপাত, অপচয় % (Scrap Factor) নির্ধারণ।
* **2.4.1.2 Production Cost Formula:**
  * $\text{Standard Cost} = \sum (\text{Qty}_i \times \text{Raw Price}_i) + \text{Direct Labor} + \text{Overhead Cost}$.

#### 2.4.2 Production Work Orders & WIP Accounting
* **2.4.2.1 Stage 1 - Raw Material Issue:**
  * `Debit: Work-In-Progress (WIP) Account`
  * `Credit: Raw Material Inventory`
* **2.4.2.2 Stage 2 - Finished Goods Receipt:**
  * `Debit: Finished Goods Inventory`
  * `Credit: Work-In-Progress (WIP) Account`

---

### 2.5 🛒 PURCHASES & SUPPLIERS (ক্রয় ও সরবরাহকারী)

#### 2.5.1 Purchase Requests & RFQ
* **2.5.1.1 RFQ Comparison:** সরবরাহকারীদের থেকে দরপত্র গ্রহণ করে তুলনামূলক তালিকা (Price/Quality Matrix) উপস্থাপন।

#### 2.5.2 Purchase Orders (PO), GRN & 3-Way Matching
* **2.5.2.1 3-Way Matching Engine:** PO Qty, GRN Received Qty এবং Supplier Invoice Amount সমান হলেই কেবল পেমেন্ট ক্লিয়ার করা হবে।
* **2.5.2.2 Landed Cost Distribution:**
  * **Formula:** $\text{Landed Cost Per Unit} = \text{Base Price} + \left( \frac{\text{Item Total}}{\text{PO Total}} \times \text{Freight/Customs Fee} \right)$.

#### 2.5.3 Manage Suppliers
* **2.5.3.1 Supplier Payable Ledger:** পাওনা টাকা, পেমেন্ট শিডিউল এবং পারচেজ রিটার্ন (Debit Note) ট্র্যাকিং।

---

### 2.6 📊 ACCOUNTING & FINANCE (হিসাববিজ্ঞান ও অর্থ ব্যবস্থাপনা)

#### 2.6.1 Double-Entry General Ledger Engine
* **2.6.1.1 Chart of Accounts Tree:**
  * 1. Assets ➔ Current Assets ➔ Inventory, Cash, Receivables
  * 2. Liabilities ➔ Current Liabilities ➔ Payables, Tax Output
  * 3. Equity ➔ Capital, Retained Earnings
  * 4. Revenue ➔ Sales Revenue, Other Income
  * 5. Expenses ➔ COGS, Operating Expenses, Salaries
* **2.6.1.2 Automatic Transaction Voucher Matrix:**
  * **Cash Sale:** `Debit: Cash`, `Credit: Sales Revenue`, `Credit: VAT Payable`.
  * **Cost of Goods Sold:** `Debit: COGS`, `Credit: Inventory`.

#### 2.6.2 Cheque Cycle Management (চেক ট্র্যাকিং)
* **2.6.2.1 Cheque Status Lifecycle Logic:**
  * 1. **Received:** `Debit: Cheque in Hand (Asset)`, `Credit: Accounts Receivable`.
  * 2. **Deposited:** `Debit: Cheque Clearing Account`, `Credit: Cheque in Hand`.
  * 3. **Cleared:** `Debit: Bank Account`, `Credit: Cheque Clearing Account`.
  * 4. **Bounced:** `Debit: Accounts Receivable`, `Credit: Cheque Clearing Account` + Bounced Charges Entry.

#### 2.6.3 Financial Reports Engine
* **2.6.3.1 Trial Balance:** $\sum \text{Debits} = \sum \text{Credits}$.
* **2.6.3.2 Profit & Loss (P&L):** $\text{Net Profit} = \text{Total Revenue} - \text{COGS} - \text{Operating Expenses}$.
* **2.6.3.3 Balance Sheet:** $\text{Assets} = \text{Liabilities} + \text{Owner's Equity}$.

---

### 2.7 👨‍💼 HR & PAYROLL (মানবসম্পদ ও পে-রোল)

#### 2.7.1 Employee Master & Org Hierarchy
* **2.7.1.1 Data:** Employee Code, Department, Designation, Reporting Manager ID, Bank Account/IBAN, Basic Salary, Allowances.

#### 2.7.2 Attendance & Timesheet Processing
* **2.7.2.1 Biometric & ESS Geo-Fencing:**
  * **Condition:** $\text{Distance} = \text{Haversine}(\text{GPS}_{user}, \text{GPS}_{branch}) \le \text{Allowed Radius (e.g., 50 meters)}$.
* **2.7.2.2 Late & Overtime Engine:**
  * **Overtime Rate:** $\text{OT Pay} = \text{OT Hours} \times (\frac{\text{Basic Salary}}{208} \times 1.5)$.

#### 2.7.3 Payroll Calculation & Direct Bank Export
* **2.7.3.1 Net Salary Formula:**
  * $\text{Net Pay} = (\text{Basic} + \text{HRA} + \text{Allowances} + \text{OT}) - (\text{Unpaid Leaves} + \text{Tax} + \text{Advance Salary} + \text{Penalties})$.
* **2.7.3.2 WPS File Export:** ব্যাংক স্থানান্তরের জন্য স্ট্যান্ডার্ড WPS (Wage Protection System) CSV/Text ফাইল জেনারেট।

---

### 2.8 ⚙️ OPERATIONS, WORK ORDERS & RENTALS (অপারেশনস মডিউল)

#### 2.8.1 Technical Work Orders & Job Cards
* **2.8.1.1 Job Card Workflow:** Problem Diagnosis ➔ Parts Allocation ➔ Technician Repair ➔ QC Approval ➔ Billing.

#### 2.8.2 Custom Kanban Workflows
* **2.8.2.1 State Automation:** কার্ড এক কলাম থেকে অন্য কলামে নিলেই কাস্টমারকে স্বয়ংক্রিয় স্ট্যাটাস SMS পাঠাবে।

#### 2.8.3 Rental and Unit Management
* **2.8.3.1 Meter Reading Billing:** $\text{Rental Amount} = \text{Fixed Base Rate} + (\text{End Meter} - \text{Start Meter}) \times \text{Per Unit Rate}$.

#### 2.8.4 PNR & Travel Booking
* **2.8.4.1 Travel Booking Ledger:** PNR রেকর্ড তৈরি, প্যাসেঞ্জার তালিকা, টিকিট ভ্যালু এবং এজেন্সির কমিশন ট্র্যাকিং।

---

### 2.9 🛠️ SETTINGS & INTEGRATIONS (সিস্টেম সেটআপ)

* **2.9.1 Regional Tax Engine:** VAT/GST হার সেটআপ, জিরো-রেটেড এবং ট্যাক্স এক্সেম্পটেড ক্যাটাগরি কনফিগারেশন।
* **2.9.2 Payment Gateway Integrations:** Stripe, PayPal, Local MFS (bKash/Nagad), এবং POS Terminal IP পেমেন্ট ব্রিজ।
* **2.9.3 Auto-Numbering Generator:** প্রিফিক্স (INV), সাল (2026), এবং প্যাডিং ডিজিট (00001) সমন্বয়ে অটো ইনক্রিমেন্টাল আইডি (`INV-2026-00001`)।
* **2.9.4 SMTP & SMS Integrations:** ইমেইল ও ট্রানজ্যাকশনাল এসএমএস গেটওয়ে API প্যারামিটার সেটআপ।
* **2.9.5 Granular Security Matrix:** প্রতি রোলের জন্য গ্র্যানুলার পারমিশন চেকিং (`req.user.permissions.includes('invoice:create')`)।

---

### 2.10 🏢 INDUSTRY-SPECIFIC CUSTOM MODULES (১৪টি শিল্পের কাস্টম লজিক)

* **2.10.1 Autoparts Store:** OEM নম্বর সার্চ, গাড়ির ব্র্যান্ড/মডেল ফিল্টারিং, অল্টারনেটিভ পার্টস প্রস্তাব করা।
* **2.10.2 Beauty Salons:** ক্যালেন্ডার শিডিউলিং, স্টাইলিস্টের সময় নির্বাচন, সেবা শেষে স্টাইলিস্ট ভিত্তিক অটো-কমিশন।
* **2.10.3 Car Rental:** গাড়ির বর্তমান অবস্থা (Available/Rented/Maintenance), কিলোমিটার ওডোমিটার রিডিং এবং ড্রাইভিং লাইসেন্স স্ক্যান।
* **2.10.4 Dental & Medical Clinics:** ডেন্টাল টুথ চার্ট (Tooth 1-32), প্রেসক্রিপশন জেনারেটর, ডাক্তারের কনসালটেন্সি ফি।
* **2.10.5 Eyewear & Optics Shop:** লেন্স পাওয়ার চশমা (Spherical, Cylinder, Axis, Addition) হিসাব করে কাস্টম ইনভয়েস প্রস্তুত করা।
* **2.10.6 Gym & Fitness Club:** আরএফআইডি বা কিউআর কোড চেক-ইন, কার্ড মেয়াদের মেয়াদোত্তীর্ণ ট্র্যাকিং, গেট লক আনলক করা।
* **2.10.7 Hotel Management:** রুম ম্যাপিং গ্রিড, রুম ক্লিয়ারেন্স স্ট্যাটাস, নাইট-অডিট রান এবং রুম সার্ভিস ফোলিও বিলিং।
* **2.10.8 Law Firms:** কেস নাম্বার, আদালতের শুনানির তারিখের ক্যালেন্ডার ট্র্যাকিং, সময় ভিত্তিক আইনজীবী আওয়ারলি বিলিং।
* **2.10.9 Pharmacy Management:** ওষুধের জেনেরিক নাম অনুসন্ধান, এক্সপায়ারি অ্যালার্ট (FEFO) এবং নিয়ন্ত্রিত ওষুধের সেলস রেজিস্টার।
* **2.10.10 PlayStation Cafe & Gaming:** কনসোল/পিসি টাইমার ইন্টিগ্রেশন। সময় গণনা শুরু থেকে শেষ হলে মিনিট হিসাব করে স্বয়ংক্রিয় বিল তৈরি।
* **2.10.11 Printing & Advertising:** ডাইমেনশন ভিত্তিক স্কেল বিলিং: $\text{Total} = (\text{Height} \times \text{Width}) \times \text{Rate Per SqFt}$.
* **2.10.12 Restaurant Management:** কিচেন ডিসপ্লে সিস্টেম (KDS) অর্ডার টিকেট জেনারেশন, টেবিল লেআউট, এবং ডিশ রেসিপি উপকরণ মাইনাস।
* **2.10.13 Retail Stores:** ফাস্ট বারকোড রিডিং, দ্রুত ক্যাশ পেমেন্ট, ডিসকাউন্ট কুপন ও গিফট ভাউচার রিডিম।
* **2.10.14 Online Store Management:** ই-কমার্স APIs মাধ্যমে স্বয়ংক্রিয় স্টক ও অর্ডার সিঙ্ক।

---

### 2.11 📱 ECOSYSTEM APPLICATIONS (সংযুক্ত ৬টি অ্যাপস)

* **2.11.1 ESS Attendance Registration App:** কর্মচারীদের সেলফি ও জিও-লোকেশনসহ উপস্থিতির অ্যাপ।
* **2.11.2 Daftra Business App:** ব্যবসায়ী ও সিইও-দের জন্য দৈনিক রিপোর্ট, ইনভয়েস এবং লাইভ সেলস ড্যাশবোর্ড।
* **2.11.3 Stocktaking App:** ফোনের ক্যামেরা দিয়ে সরাসরি গুদামের পণ্যের বারকোড স্ক্যান করে ইনভেন্টরি গণনা।
* **2.11.4 Electronic Invoice Scanner App:** ZATCA ও ই-ইনভয়েস কিউআর কোড স্ক্যান করে রিয়েল-টাইম ভ্যালিডেশন চেক।
* **2.11.5 POS Desktop & Mobile App:** ট্যাবলেট এবং ডেস্কটপে দ্রুত পয়েন্ট অব সেলস চালানোর মোবাইল/ডেস্কটপ অ্যাপ।
* **2.11.6 Quick Expenses Scanner App:** ওসিআর (OCR) ক্যামেরা রিডার দিয়ে কেনাকাটার রসিদ স্ক্যান করে স্বয়ংক্রিয় খরচ এন্ট্রি।

---

### 2.12 📈 REPORTS & ANALYTICS ENGINE (১৩টি প্রধান রিপোর্ট স্যুট)

1. **Sales Reports:** দৈনিক, সাপ্তাহিক ও মাসিক সেলস, আইটেম-ওয়াইজ সেলস, ক্যাশিয়ার পারফর্মেন্স, সেলস প্রফিটেবিলিটি।
2. **Purchases Reports:** সাপ্লায়ার পারচেজ সামারি, পণ্য গ্রহণের তালিকা (GRN), পারচেজ রিটার্ন।
3. **Accounting Reports:** জেনারেল লেজার স্টেটমেন্ট, ভাউচার রেজিস্টার, ট্রায়াল ব্যালেন্স, পিঅ্যান্ডএল, ব্যালেন্স শিট।
4. **System Activity Audit Log:** ইউজার আইডি, কাজের ধরণ (CREATE/UPDATE/DELETE), পরিবর্তিত ফিল্ডের পূর্বের ও বর্তমান মান, টাইমস্ট্যাম্প ও আইপি এড্রেস।
5. **Cheque Reports:** জমা চেক, পেন্ডিং চেক, বাউন্স চেক স্টেটমেন্ট।
6. **Clients Reports:** গ্রাহকের আউটস্ট্যান্ডিং লেজার, বয়স ভিত্তিক বাকি (Aging Analysis Report: 30/60/90 Days)।
7. **Employee Reports:** উপস্থিতি রিপোর্ট, পে-রোল সামারি, লেট ও লিভ স্ট্যাটাস।
8. **Manufacturing Reports:** উপাদান ব্যবহার (Material Consumption), অপচয় (WIP Scrap) ও উৎপাদন খরচ রিপোর্ট।
9. **PNR Reports:** ট্রাভেল বুকিং সামারি ও এজেন্সি কমিশন রিপোর্ট।
10. **Points and Credits Reports:** অর্জিত ও রিডিমকৃত লয়ালটি পয়েন্ট এবং কাস্টমার ওয়ালেট ব্যালেন্স।
11. **Rental Reports:** রেন্টাল এসেটের বর্তমান অবস্থা, আয় এবং ওডোমিটার ব্যবহার রিপোর্ট।
12. **SMS Reports:** পাঠানো মেসেজ, ওটিপি ট্র্যাকিং ও এসএমএস ব্যালেন্স রিপোর্ট।
13. **Store Stock Reports:** স্টক ভ্যালুয়েশন রিপোর্ট (Weighted Average/FIFO), রিকুইজিশন হিস্ট্রি, ফাস্ট/স্লো মুভিং গুডস।

---
