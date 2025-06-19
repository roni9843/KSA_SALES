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

