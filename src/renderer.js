// src/renderer.js
const db = require('../db/database');

// ডেমো প্রোডাক্ট অ্যাড করো (একবার)
const newId = db.addProduct("Bike Brake Pad", 350.50, 20);
console.log("New Product Inserted with ID:", newId);

// সব প্রোডাক্ট দেখাও
const products = db.getAllProducts();
console.log("All Products:", products);
