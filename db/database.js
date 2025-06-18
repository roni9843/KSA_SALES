// db/database.js
const Database = require('better-sqlite3');
const path = require('path');

// DB ফাইল তৈরি / কানেক্ট
const dbPath = path.resolve(__dirname, 'moto-pos.db');
const db = new Database(dbPath);

// Products টেবিল তৈরি (যদি না থাকে)
const createProductTable = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  );
`;
db.exec(createProductTable);

// Sample function: প্রোডাক্ট যোগ
function addProduct(name, price, stock) {
    const stmt = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)");
    const info = stmt.run(name, price, stock);
    return info.lastInsertRowid;
}

// Sample function: সব প্রোডাক্ট লোড
function getAllProducts() {
    const stmt = db.prepare("SELECT * FROM products");
    return stmt.all();
}

module.exports = {
    addProduct,
    getAllProducts
};
