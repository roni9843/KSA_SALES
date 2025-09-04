const db = require('../database/db');

module.exports = function(ipcMain) {
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
};
