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



// invoice related tables
db.serialize(() => {
  // Drop existing tables if they exist to apply new schema
  // db.run(`DROP TABLE IF EXISTS invoice`);
  // db.run(`DROP TABLE IF EXISTS invoice_details`);
  // db.run(`DROP TABLE IF EXISTS invoice_item`);
  // db.run(`DROP TABLE IF EXISTS customer_payment_history`);

  // Create new tables based on renderer/invoice-related-table.md

  // invoice table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      invoice_date TEXT NOT NULL,
      sub_total REAL NOT NULL,
      item_discount REAL NOT NULL,
      item_tax REAL NOT NULL,
      cart_discount REAL NOT NULL,
      payable_total REAL NOT NULL,
      paid_amount REAL NOT NULL,
      due_amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // invoice_item table
  // invoice_item table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoice(id),
      FOREIGN KEY (product_id) REFERENCES product(id)
    )
  `);

  // Add pre_stock and new_stock to invoice_item
  db.all("PRAGMA table_info(invoice_item)", (err, columns) => {
    if (err) return console.error("PRAGMA error:", err.message);
    const existingColumns = columns.map(c => c.name);
    if (!existingColumns.includes('pre_stock')) {
      db.run("ALTER TABLE invoice_item ADD COLUMN pre_stock INTEGER DEFAULT 0");
    }
    if (!existingColumns.includes('new_stock')) {
      db.run("ALTER TABLE invoice_item ADD COLUMN new_stock INTEGER DEFAULT 0");
    }
  });

  // customer_payment_history table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_payment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      payment_date TEXT NOT NULL,
      pre_due_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      due_amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoice(id)
    )
  `);
});

db.all("PRAGMA table_info(customer_payment_history)", (err, columns) => {
    if (err) return console.error("PRAGMA error:", err.message);
    const existingColumns = columns.map(c => c.name);
    const newPaymentColumns = [
        { name: 'paid_amount_cash', type: 'REAL', default: 0 },
        { name: 'paid_amount_card', type: 'REAL', default: 0 },
        { name: 'paid_amount_bank', type: 'REAL', default: 0 }
    ];

    newPaymentColumns.forEach(col => {
        if (!existingColumns.includes(col.name)) {
            let query = `ALTER TABLE customer_payment_history ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`;
            db.run(query, (err) => {
                if (err) {
                    console.error(`Error adding ${col.name} column to customer_payment_history:`, err.message);
                } else {
                    console.log(`✅ '${col.name}' column added to customer_payment_history table`);
                }
            });
        }
    });
});

db.all("PRAGMA table_info(invoice)", (err, columns) => {
    if (err) return console.error("PRAGMA error:", err.message);
    const existingColumns = columns.map(c => c.name);
    const newPaymentColumns = [
        { name: 'paid_amount_cash', type: 'REAL', default: 0 },
        { name: 'paid_amount_card', type: 'REAL', default: 0 },
        { name: 'paid_amount_bank', type: 'REAL', default: 0 }
    ];

    newPaymentColumns.forEach(col => {
        if (!existingColumns.includes(col.name)) {
            let query = `ALTER TABLE invoice ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`;
            db.run(query, (err) => {
                if (err) {
                    console.error(`Error adding ${col.name} column to invoice:`, err.message);
                } else {
                    console.log(`✅ '${col.name}' column added to invoice table`);
                }
            });
        }
    });
});

// tax table
db.run(`
  CREATE TABLE IF NOT EXISTS tax (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_label TEXT NOT NULL,
    tax_percentage REAL NOT NULL
  )
`);

// db.run(`DROP TABLE IF EXISTS customers`, (err) => {
//   if (err) {
//     console.error("Error dropping customers table:", err.message);
//   } else {
//     console.log("✅ customers table dropped successfully (if it existed)");
//   }
// });

// db.run(`DROP TABLE IF EXISTS suppliers`, (err) => {
//   if (err) {
//     console.error("Error dropping suppliers table:", err.message);
//   } else {
//     console.log("✅ suppliers table dropped successfully (if it existed)");
//   }
// });

// customers table
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    zip_code TEXT,
    city TEXT,
    country TEXT,
    tax_number TEXT,
    status INTEGER DEFAULT 1
  )
`);

// Add Uakam_no to customers
db.all("PRAGMA table_info(customers)", (err, columns) => {
  if (err) return console.error("PRAGMA error:", err.message);
  const existingColumns = columns.map(c => c.name);
  if (!existingColumns.includes('Uakam_no')) {
    db.run("ALTER TABLE customers ADD COLUMN Uakam_no TEXT");
  }
});

// suppliers table
db.run(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    zip_code TEXT,
    city TEXT,
    country TEXT,
    tax_number TEXT,
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

  // Add pre_stock and new_stock to product_purchase_item
  db.all("PRAGMA table_info(product_purchase_item)", (err, columns) => {
    if (err) return console.error("PRAGMA error:", err.message);
    const existingColumns = columns.map(c => c.name);
    if (!existingColumns.includes('pre_stock')) {
      db.run("ALTER TABLE product_purchase_item ADD COLUMN pre_stock INTEGER DEFAULT 0");
    }
    if (!existingColumns.includes('new_stock')) {
      db.run("ALTER TABLE product_purchase_item ADD COLUMN new_stock INTEGER DEFAULT 0");
    }
  });

const bcrypt = require('bcrypt');

// Role-based authentication tables
db.serialize(() => {
  // users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // roles table
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // user_roles table (many-to-many)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    )
  `);

  // permissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  // role_permissions table (many-to-many)
  db.run(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `);
});

// settings table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL,
      writing_direction TEXT NOT NULL,
      color_scheme TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      shop_address TEXT NOT NULL,
      shop_phone TEXT NOT NULL,
      shop_email TEXT NOT NULL,
      shop_logo TEXT NOT NULL
    )
  `);

  // default settings data
    db.get('SELECT * FROM settings WHERE id = ?', [1], (err, settings) => {
        if (err) {
            return console.error('Error checking for settings:', err.message);
        }
        if (!settings) {
            db.run(`
                INSERT INTO settings (id, language, writing_direction, color_scheme, shop_name, shop_address, shop_phone, shop_email, shop_logo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [1, 'en', 'ltr', 'light', 'Moto POS', 'Mirpur 10, Dhaka', '01700000000', 'example@email.com', ''])
        }
    });
});

// Seed initial data for authentication
db.get('SELECT * FROM users WHERE username = ?', ['supperAdmin'], (err, user) => {
  if (err) {
    return console.error('Error checking for supperAdmin:', err.message);
  }
  if (!user) {
    console.log('supperAdmin not found, creating...');
    // Hash the password
    bcrypt.hash('123456', 10, (err, hash) => {
      if (err) {
        return console.error('Error hashing password:', err.message);
      }

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. Insert supperAdmin role
        db.run(`INSERT INTO roles (name) VALUES (?)`, ['supperAdmin'], function(err) {
          if (err) {
            console.error('Error inserting supperAdmin role:', err.message);
            return db.run('ROLLBACK');
          }
          const supperAdminRoleId = this.lastID;
          console.log('supperAdmin role created with ID:', supperAdminRoleId);

          // 2. Insert supperAdmin user
          db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['supperAdmin', hash], function(err) {
            if (err) {
              console.error('Error inserting supperAdmin user:', err.message);
              return db.run('ROLLBACK');
            }
            const supperAdminUserId = this.lastID;
            console.log('supperAdmin user created with ID:', supperAdminUserId);

            // 3. Define Permissions
            const permissions = [
              { name: 'page:view:home', description: 'Access the Home page' },
              { name: 'page:view:dashboard', description: 'Access the Dashboard page' },
              { name: 'page:view:category', description: 'Access the Category page' },
              { name: 'page:view:products', description: 'Access the Products pages (Add and List)' },
              { name: 'page:view:invoice', description: 'Access the Invoice pages (Create and List)' },
              { name: 'page:view:customers', description: 'Access the Customers pages (Add and List)' },
              { name: 'page:view:suppliers', description: 'Access the Suppliers pages (Add and List)' },
              { name: 'page:view:reporting', description: 'Access the Reporting page' },
              { name: 'page:view:tax-rates', description: 'Access the Tax Rates page' },
              { name: 'page:view:my-company', description: 'Access the My Company page' },
              { name: 'page:view:purchase', description: 'Access the Purchase pages (Add and List)' },
              { name: 'page:view:stock', description: 'Access the Stock Adjustment pages' },
              { name: 'manage:users', description: 'Manage users, roles, and permissions' },
            ];

            const permissionStmt = db.prepare(`INSERT INTO permissions (name, description) VALUES (?, ?)`);
            const rolePermissionStmt = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);

            let permissionsCompleted = 0;
            permissions.forEach(p => {
              permissionStmt.run([p.name, p.description], function(err) {
                if (err) {
                  console.error(`Error inserting permission ${p.name}:`, err.message);
                  return db.run('ROLLBACK');
                }
                const permissionId = this.lastID;
                // 4. Assign all permissions to supperAdmin role
                rolePermissionStmt.run([supperAdminRoleId, permissionId], function(err) {
                  if (err) {
                    console.error(`Error assigning permission ${p.name} to supperAdmin:`, err.message);
                    return db.run('ROLLBACK');
                  }
                  permissionsCompleted++;
                  if (permissionsCompleted === permissions.length) {
                    console.log('All permissions created and assigned to supperAdmin.');
                    permissionStmt.finalize();
                    rolePermissionStmt.finalize();
                    // 5. Assign supperAdmin role to supperAdmin user
                    db.run(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [supperAdminUserId, supperAdminRoleId], function(err) {
                      if (err) {
                        console.error('Error assigning role to user:', err.message);
                        return db.run('ROLLBACK');
                      }
                      console.log('Assigned supperAdmin role to supperAdmin user.');
                      db.run('COMMIT');
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  } else {
    console.log('supperAdmin user already exists.');
  }
});

module.exports = db;

// Stock Adjustment Tables
db.serialize(() => {
  // stock_adjustment table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_adjustment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_adjustment_no TEXT NOT NULL,
      stock_adjustment_date TEXT NOT NULL,
      stock_adjustment_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stock_adjustment_by) REFERENCES users(id)
    )
  `);

  // stock_adjustment_item table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_adjustment_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_adjustment_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'add' or 'subtract'
      pre_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      FOREIGN KEY (stock_adjustment_id) REFERENCES stock_adjustment(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES product(id)
    )
  `);
});
