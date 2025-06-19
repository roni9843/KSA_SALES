const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'moto_pos.db');
const db = new sqlite3.Database(dbPath);

// টেবিল তৈরি: product_category
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS product_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ✅ product table তৈরি
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      purchase_price REAL,
      sale_price REAL,
      quantity_in_stock INTEGER DEFAULT 0,
      unit TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES product_category(id)
    )
  `);
});


module.exports = db;
