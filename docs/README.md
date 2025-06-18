# Moto POS

### Overview
Moto POS হল একটি Electron ভিত্তিক ডেক্সটপ POS অ্যাপ যা বাইক এবং গাড়ির পার্টস বিক্রির জন্য তৈরি। অ্যাপটি offline-first হিসেবে কাজ করবে এবং ভবিষ্যতে online sync সুবিধা থাকবে।

---

### Step 1: Project Initialization

1. Create folder: `mkdir moto-pos`
2. Initialize Node.js: `npm init -y`
3. Install Electron: `npm install electron --save-dev`
4. Create files:
   - `src/main.js`
   - `src/index.html`
   - `src/renderer.js`
5. Add start script:
   ```json
   "scripts": {
     "start": "electron ."
   }
6. Run App: npm start

