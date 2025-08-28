const db = require('../database/db');

module.exports = (ipcMain) => {
    // IPC for get-customers
    ipcMain.handle('get-customers', async (event, { page = 1, limit = 10, searchTerm = '' }) => {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            let whereClause = '';
            const params = [];

            if (searchTerm) {
                whereClause = `WHERE name LIKE ? OR phone LIKE ? OR tax_number LIKE ? OR Uakam_no LIKE ?`;
                const searchTermLike = `%${searchTerm}%`;
                params.push(searchTermLike, searchTermLike, searchTermLike, searchTermLike);
            }

            const countSql = `SELECT COUNT(*) as count FROM customers ${whereClause}`;
            db.get(countSql, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    return reject('Error counting customers');
                }

                const totalCount = row.count;
                const queryParams = [...params, limit, offset];
                const sql = `SELECT * FROM customers ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;

                db.all(sql, queryParams, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject('Error loading customers');
                    } else {
                        resolve({ rows, totalCount });
                    }
                });
            });
        });
    });

    // IPC for update-customer
    ipcMain.handle('update-customer', async (event, customer) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE customers SET name = ?, code = ?, phone = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?, tax_number = ?, status = ?, Uakam_no = ? WHERE id = ?`;
            const params = [customer.name, customer.code, customer.phone, customer.email, customer.address, customer.zip_code, customer.city, customer.country, customer.tax_number, customer.status, customer.Uakam_no, customer.id];
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
          (name, code, phone, email, address, zip_code, city, country, tax_number, status, Uakam_no)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                customer.status,
                customer.Uakam_no
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