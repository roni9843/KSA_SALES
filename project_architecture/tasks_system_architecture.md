# 📋 Tasks & Project Management System Architecture
## (টাস্ক ও প্রজেক্ট ম্যানেজমেন্ট মডিউলের বিস্তারিত ৪-লেভেল প্রযুক্তিগত বিবরণী)

---

## 1. 📁 PROJECT CREATION & MANAGEMENT (প্রজেক্ট তৈরি)

### 1.1 Project Setup & Milestones
* **1.1.1 Project Master Details:** প্রজেক্টের নাম, ক্লায়েন্ট ট্যাগ, শুরুর তারিখ, আনুমানিক শেষ তারিখ এবং মোট বাজেট নির্ধারণ।
* **1.1.2 Milestones Setup:** প্রজেক্টকে একাধিক মাইলস্টোনে (Milestones) ভাগ করে প্রতিটি ধাপের বাজেট ও সময়সীমা নির্দিষ্ট করা।

---

## 2. 📌 TASK ASSIGNMENT & TEAM COLLABORATION (টাস্ক অ্যাসাইনমেন্ট)

### 2.1 Task Allocation Rules
* **2.1.1 Task Creation:** টাস্কের শিরোনাম, বিস্তারিত বিবরণ, প্রায়োরিটি (Low, Medium, High, Urgent) এবং ফাইল অ্যাটাচমেন্ট যুক্ত করা।
* **2.1.2 Team Member Assignment:** নির্দিষ্ট টিম মেম্বারদের কাছে কাজ অ্যাসাইন করা এবং তাদের কাছে স্বয়ংসক্রিয় নোটিফিকেশন পৌঁছানো।

---

## 3. 📊 PROGRESS TRACKING & KANBAN (অগ্রগতি ট্র্যাকিং)

### 3.1 Visual Kanban Board & Pipeline
* **3.1.1 Kanban Pipeline:** `To-Do` ➔ `In Progress` ➔ `In Review` ➔ `Completed`.
* **3.1.2 Time Spent vs Estimated:** আনুমানিক কাজের সময় (Estimated Hours) বনাম প্রকৃত ব্যয়িত সময়ের (Actual Logged Hours) ট্র্যাকিং।

---

## 4. 💾 MongoDB Schemas for Tasks System

```javascript
// models/TaskSystemModels.js
const mongoose = require('mongoose');

// 1. Project Schema
const ProjectSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  startDate: Date,
  endDate: Date,
  budget: { type: Number, default: 0 },
  status: { type: String, enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'], default: 'PLANNING' }
}, { timestamps: true });

// 2. Task Schema
const TaskSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: String,
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'], default: 'TODO' },
  dueDate: Date,
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Project: mongoose.model('Project', ProjectSchema),
  Task: mongoose.model('Task', TaskSchema)
};
```
