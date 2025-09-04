const db = require('../database/db');

module.exports = function(ipcMain) {
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
};
