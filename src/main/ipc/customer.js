const db = require('../database/db');

module.exports = (ipcMain) => {
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
            const sql = `UPDATE customers SET name = ?, code = ?, phone = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?, tax_number = ?, status = ? WHERE id = ?`;
            const params = [customer.name, customer.code, customer.phone, customer.email, customer.address, customer.zip_code, customer.city, customer.country, customer.tax_number, customer.status, customer.id];
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
          (name, code, phone, email, address, zip_code, city, country, tax_number, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
            const params = [
                customer.name,
                customer.code,
                customer.phone,
                customer.email,
                customer.address,
                customer.zip_code,
                customer.city,
                customer.country,
                customer.tax_number,
                customer.status
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

    ipcMain.handle('search-customers', async (event, searchTerm) => {
        return new Promise((resolve, reject) => {
            const sql = `
        SELECT * FROM customers
        WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
        AND status = 1
        ORDER BY name
      `;
            const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject('Error searching customers');
                } else {
                    resolve(rows);
                }
            });
        });
    });
};