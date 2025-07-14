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

// ✅ tax column যোগ করা
db.all("PRAGMA table_info(product)", (err, columns) => {
  if (err) return console.error("PRAGMA error:", err.message);

  const columnExists = columns.some(col => col.name === 'tax');

  if (!columnExists) {
    db.run(`ALTER TABLE product ADD COLUMN tax REAL DEFAULT 0`, (err) => {
      if (err) {
        console.error("Error adding tax column:", err.message);
      } else {
        console.log("✅ 'tax' column added to product table");
      }
    });
  } else {
    console.log("ℹ️ 'tax' column already exists");
  }
});



// ✅ invoices টেবিল
db.run(`
  CREATE TABLE IF NOT EXISTS invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    total REAL,
    discount REAL,
    tax REAL,
    paid REAL,
    due REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ✅ invoice_details টেবিল
db.run(`
  CREATE TABLE IF NOT EXISTS invoice_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price REAL,
    total_price REAL,
    FOREIGN KEY (invoice_id) REFERENCES invoice(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
  )
`);

module.exports = db;
