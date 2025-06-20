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
      (name, sku, category_id, description, purchase_price, sale_price, quantity_in_stock, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

// সব প্রোডাক্ট লোড করার জন্য
ipcMain.handle('get-products', async () => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT
        p.id, p.name, p.sku, p.description,
        p.purchase_price, p.sale_price,
        p.quantity_in_stock, p.unit,
        p.created_at,
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
        const db = require('./database/db');
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 1. ইনভয়েস ইনসার্ট
            const stmt = `
        INSERT INTO invoice (customer_name, total, discount, tax, paid, due)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
            const invoiceParams = [
                data.customer_name,
                data.total,
                data.discount,
                data.tax,
                data.paid,
                data.total - data.paid
            ];

            db.run(stmt, invoiceParams, function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return reject('Failed to create invoice');
                }

                const invoiceId = this.lastID;

                // 2. প্রতিটি পণ্যের ইনভয়েস ডিটেইল ও স্টক কমানো
                for (const item of data.items) {
                    db.run(`
            INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [invoiceId, item.product_id, item.quantity, item.unit_price, item.total_price]);

                    // stock কমানো
                    db.run(`
            UPDATE product
            SET quantity_in_stock = quantity_in_stock - ?
            WHERE id = ?
          `, [item.quantity, item.product_id]);
                }

                db.run('COMMIT');
                resolve({ success: true, invoice_id: invoiceId });
            });
        });
    });
});

// 🟨 IPC for get-invoice
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


ipcMain.handle('ping', () => {
    return 'pong';
});




