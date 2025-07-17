const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database/db');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false, // এটাকে অবশ্যই false রাখতে হবে
        },
    });

    const startUrl = app.isPackaged
        ? `file://${path.join(__dirname, '../../renderer/dist/index.html')}`
        : 'http://localhost:5173';

    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 🟨 IPC for add-category
ipcMain.handle('add-category', async (event, name) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO product_category (name) VALUES (?)`, [name], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error inserting category');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});

// সব ক্যাটেগরি লোড করার জন্য
ipcMain.handle('get-categories', async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM product_category ORDER BY id DESC`, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error reading categories');
            } else {
                resolve(rows);
            }
        });
    });
});

// ক্যাটেগরি ডিলিট করার জন্য
ipcMain.handle('delete-category', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM product_category WHERE id = ?`, [id], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error deleting category');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// 🟨 IPC for add-product
ipcMain.handle('add-product', async (event, product) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO product
      (name, sku, category_id, description, purchase_price, sale_price, quantity_in_stock, unit, tax, markup, code, barcode, active, default_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            product.name,
            product.sku,
            product.category_id,
            product.description,
            product.purchase_price,
            product.sale_price,
            product.quantity_in_stock,
            product.unit,
            product.tax,
            product.markup,
            product.code,
            product.barcode,
            product.active,
            product.default_quantity
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error adding product');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});

// IPC for update-product
ipcMain.handle('update-product', async (event, product) => {
    return new Promise((resolve, reject) => {
        const sql = `
      UPDATE product SET
        name = ?,
        sku = ?,
        category_id = ?,
        description = ?,
        purchase_price = ?,
        sale_price = ?,
        quantity_in_stock = ?,
        unit = ?,
        tax = ?,
        markup = ?,
        code = ?,
        barcode = ?,
        active = ?,
        default_quantity = ?
      WHERE id = ?
    `;
        const params = [
            product.name,
            product.sku,
            product.category_id,
            product.description,
            product.purchase_price,
            product.sale_price,
            product.quantity_in_stock,
            product.unit,
            product.tax,
            product.markup,
            product.code,
            product.barcode,
            product.active,
            product.default_quantity,
            product.id
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error updating product');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// সব প্রোডাক্ট লোড করার জন্য
ipcMain.handle('get-products', async () => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT
        p.*,
        c.name as category_name
      FROM product p
      LEFT JOIN product_category c ON p.category_id = c.id
      ORDER BY p.id DESC
    `;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error loading products');
            } else {
                resolve(rows);
            }
        });
    });
});


// 🟨 IPC for create-invoice
ipcMain.handle('create-invoice', async (event, data) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const invoice = data.invoice;
            const items = data.details;

            const stmt = `
        INSERT INTO invoice (customer_name, total, discount, tax, paid, due)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

            const invoiceParams = [
                invoice.customer_name,
                invoice.total,
                invoice.discount,
                invoice.tax,
                invoice.paid,
                invoice.due
            ];

            db.run(stmt, invoiceParams, function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return reject('Failed to create invoice');
                }

                const invoiceId = this.lastID;

                for (const item of items) {
                    db.run(`
            INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [invoiceId, item.product_id, item.quantity, item.unit_price, item.total_price]);

                    db.run(`
            UPDATE product
            SET quantity_in_stock = quantity_in_stock - ?
            WHERE id = ?
          `, [item.quantity, item.product_id]);
                }

                db.run('COMMIT');
                resolve(invoiceId);
            });
        });
    });
});


// 🟨 IPC for get-invoice Single Invoice
ipcMain.handle('get-invoice', async (event, invoiceId) => {
    return new Promise((resolve, reject) => {
        const sql1 = `SELECT * FROM invoice WHERE id = ?`;
        const sql2 = `
      SELECT d.*, p.name as product_name
      FROM invoice_details d
      JOIN product p ON d.product_id = p.id
      WHERE d.invoice_id = ?
    `;

        db.get(sql1, [invoiceId], (err, invoice) => {
            if (err) return reject(err);
            db.all(sql2, [invoiceId], (err2, details) => {
                if (err2) return reject(err2);
                resolve({ invoice, details });
            });
        });
    });
});

// 🟨 IPC for get-invoices All Invoices
ipcMain.handle('get-invoices', async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM invoice ORDER BY id DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});


// IPC for add-tax
ipcMain.handle('add-tax', async (event, tax) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO tax
      (tax_label, tax_percentage)
      VALUES (?, ?)
    `;
        const params = [
            tax.tax_label,
            tax.tax_percentage,
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error adding tax');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});


ipcMain.handle('ping', () => {
    return 'pong';
});

// IPC for get-taxes
ipcMain.handle('get-taxes', async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tax ORDER BY id DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error loading taxes');
            } else {
                resolve(rows);
            }
        });
    });
});

require('./ipc/product');

// IPC for add-supplier
ipcMain.handle('add-supplier', async (event, supplier) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO suppliers
      (name, phone, email, address)
      VALUES (?, ?, ?, ?)
    `;
        const params = [
            supplier.name,
            supplier.phone,
            supplier.email,
            supplier.address,
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error adding supplier');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});

// IPC for get-suppliers
ipcMain.handle('get-suppliers', async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM suppliers WHERE status = 1 ORDER BY id DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error loading suppliers');
            } else {
                resolve(rows);
            }
        });
    });
});

// IPC for update-supplier
ipcMain.handle('update-supplier', async (event, supplier) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?`;
        const params = [supplier.name, supplier.phone, supplier.email, supplier.address, supplier.id];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error updating supplier');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC for delete-supplier (soft delete)
ipcMain.handle('delete-supplier', async (event, id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE suppliers SET status = 0 WHERE id = ?`;
        db.run(sql, [id], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error deleting supplier');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC for get-customers
ipcMain.handle('get-customers', async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM customers ORDER BY id DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error loading customers');
            } else {
                resolve(rows);
            }
        });
    });
});

// IPC for update-customer
ipcMain.handle('update-customer', async (event, customer) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE customers SET name = ?, customer_tax_no = ?, address = ?, zip_code = ?, city = ?, state = ?, phone = ?, email = ? WHERE id = ?`;
        const params = [customer.name, customer.customer_tax_no, customer.address, customer.zip_code, customer.city, customer.state, customer.phone, customer.email, customer.id];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error updating customer');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC for delete-customer
ipcMain.handle('delete-customer', async (event, id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM customers WHERE id = ?`;
        db.run(sql, [id], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error deleting customer');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC for add-customer
ipcMain.handle('add-customer', async (event, customer) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO customers
      (name, customer_tax_no, address, zip_code, city, state, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            customer.name,
            customer.customer_tax_no,
            customer.address,
            customer.zip_code,
            customer.city,
            customer.state,
            customer.phone,
            customer.email,
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error adding customer');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});

// IPC for update-tax
ipcMain.handle('update-tax', async (event, tax) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tax SET tax_label = ?, tax_percentage = ? WHERE id = ?`;
        const params = [tax.tax_label, tax.tax_percentage, tax.id];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error updating tax');
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC for delete-tax
ipcMain.handle('delete-tax', async (event, id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM tax WHERE id = ?`;
        db.run(sql, [id], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error deleting tax');
            } else {
                resolve({ success: true });
            }
        });
    });
});





