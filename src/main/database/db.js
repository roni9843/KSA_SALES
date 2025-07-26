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
      tax REAL DEFAULT 0,
      markup REAL,
      code TEXT,
      barcode TEXT,
      active INTEGER DEFAULT 1,
      default_quantity INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES product_category(id)
    )
  `);
});


// ✅ New columns for product table
// const newProductColumns = [
//   { name: 'markup', type: 'REAL' },
//   { name: 'code', type: 'TEXT' },
//   { name: 'barcode', type: 'TEXT' },
//   { name: 'active', type: 'INTEGER', default: 1 },
//   { name: 'default_quantity', type: 'INTEGER', default: 0 }
// ];

// db.all("PRAGMA table_info(product)", (err, columns) => {
//   if (err) return console.error("PRAGMA error:", err.message);

//   const existingColumns = columns.map(c => c.name);

//   newProductColumns.forEach(col => {
//     if (!existingColumns.includes(col.name)) {
//       let query = `ALTER TABLE product ADD COLUMN ${col.name} ${col.type}`;
//       if (col.default !== undefined) {
//         query += ` DEFAULT ${col.default}`;
//       }
//       db.run(query, (err) => {
//         if (err) {
//           console.error(`Error adding ${col.name} column:`, err.message);
//         } else {
//           console.log(`✅ '${col.name}' column added to product table`);
//         }
//       });
//     } else {
//       console.log(`ℹ️ '${col.name}' column already exists`);
//     }
//   });
// });



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

// tax table
db.run(`
  CREATE TABLE IF NOT EXISTS tax (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_label TEXT NOT NULL,
    tax_percentage REAL NOT NULL
  )
`);

// customers table
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer_tax_no TEXT,
    address TEXT,
    zip_code TEXT,
    city TEXT,
    state TEXT,
    phone TEXT NOT NULL,
    email TEXT
  )
`);

// suppliers table
db.run(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    status INTEGER DEFAULT 1
  )
`);

// product_purchase table
db.run(`
  CREATE TABLE IF NOT EXISTS product_purchase (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id TEXT NOT NULL,
    supplier_invoice_no TEXT,
    supplier_invoice_date TEXT NOT NULL,
    purchase_date TEXT NOT NULL,
    supplier_id INTEGER NOT NULL,
    grand_total REAL NOT NULL,
    grand_total_before_tax REAL NOT NULL,
    tax_amount REAL NOT NULL,
    discount_amount REAL NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  )
`);

// product_purchase_item table
db.run(`
  CREATE TABLE IF NOT EXISTS product_purchase_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    tax_percentage REAL DEFAULT 0,
    price REAL NOT NULL,
    discount_percentage REAL DEFAULT 0,
    total_before_tax REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (product_purchase_id) REFERENCES product_purchase(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
  )
`);

module.exports = db;
