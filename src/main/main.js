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


require('./ipc/product.js')(ipcMain);
require('./ipc/purchase.js')(ipcMain);
require('./ipc/invoice.js')(ipcMain);
require('./ipc/customer.js')(ipcMain);
require('./ipc/auth.js')(ipcMain);
require('./ipc/permissions.js')(ipcMain);
require('./ipc/roles.js')(ipcMain);
require('./ipc/users.js')(ipcMain);
require('./ipc/tax.js')(ipcMain);
require('./ipc/payment.js')(ipcMain);
require('./ipc/dashboard.js')(ipcMain);
require('./ipc/reporting.js')(ipcMain);


// settings
ipcMain.handle('get-settings', async () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM settings WHERE id = ?`, [1], (err, row) => {
            if (err) {
                console.error(err.message);
                reject('Error reading settings');
            } else {
                resolve(row);
            }
        });
    });
});

ipcMain.handle('update-settings', async (event, settings) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE settings
            SET language = ?, writing_direction = ?, color_scheme = ?, shop_name = ?, shop_address = ?, shop_phone = ?, shop_email = ?, shop_logo = ?
            WHERE id = ?
        `;
        const params = [
            settings.language,
            settings.writing_direction,
            settings.color_scheme,
            settings.shop_name,
            settings.shop_address,
            settings.shop_phone,
            settings.shop_email,
            settings.shop_logo,
            1
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error(err.message);
                reject('Error updating settings');
            } else {
                resolve({ success: true });
            }
        });
    });
});



// IPC for add-supplier
ipcMain.handle('add-supplier', async (event, supplier) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO suppliers
      (name, code, phone, email, address, zip_code, city, country, tax_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            supplier.name,
            supplier.code,
            supplier.phone,
            supplier.email,
            supplier.address,
            supplier.zip_code,
            supplier.city,
            supplier.country,
            supplier.tax_number,
            supplier.status
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
        const sql = `UPDATE suppliers SET name = ?, code = ?, phone = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?, tax_number = ?, status = ? WHERE id = ?`;
        const params = [supplier.name, supplier.code, supplier.phone, supplier.email, supplier.address, supplier.zip_code, supplier.city, supplier.country, supplier.tax_number, supplier.status, supplier.id];
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



// IPC for searching products
ipcMain.handle('search-products', async (event, searchTerm) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT * FROM product
      WHERE (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)
      AND active = 1
      ORDER BY name
    `;
        const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error searching products');
            } else {
                resolve(rows);
            }
        });
    });
});

ipcMain.handle('generate-purchase-id', async () => {
    return new Promise((resolve, reject) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        const sql = `SELECT COUNT(*) as count FROM product_purchase WHERE purchase_id LIKE ?`;
        db.get(sql, [`${datePrefix}%`], (err, row) => {
            if (err) {
                console.error(err.message);
                return reject('Error generating purchase ID');
            }

            const count = row.count + 1;
            const sequence = String(count).padStart(4, '0');
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const purchaseId = `${datePrefix}-${sequence}-${randomPart}`;

            resolve(purchaseId);
        });
    });
});