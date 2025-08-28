const db = require('../database/db');

module.exports = (ipcMain) => {
    ipcMain.handle('get-payment-history', async (event, { filters, page = 1, limit = 10 }) => {
        return new Promise((resolve, reject) => {
            let baseSql = `
                FROM
                    customer_payment_history ph
                JOIN
                    invoice i ON ph.invoice_id = i.id
                JOIN
                    customers c ON i.customer_id = c.id
            `;

            const whereClauses = [];
            const params = [];

            if (filters) {
                if (filters.paymentDate) {
                    whereClauses.push("date(ph.payment_date) = date(?)");
                    params.push(filters.paymentDate);
                }
                if (filters.customerName) {
                    whereClauses.push("c.name LIKE ?");
                    params.push(`%${filters.customerName}%`);
                }
            }

            if (whereClauses.length > 0) {
                baseSql += " WHERE " + whereClauses.join(" AND ");
            }

            const countSql = `SELECT COUNT(*) as total ${baseSql}`;

            db.get(countSql, params, (err, row) => {
                if (err) {
                    return reject(err);
                }
                const total = row.total;

                const offset = (page - 1) * limit;
                const dataSql = `
                    SELECT
                        ph.id,
                        ph.payment_date,
                        ph.paid_amount,
                        ph.due_amount,
                        i.id as invoice_id_pk,
                        i.invoice_id,
                        c.name as customer_name
                    ${baseSql}
                    ORDER BY ph.id DESC
                    LIMIT ? OFFSET ?
                `;

                db.all(dataSql, [...params, limit, offset], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ payments: rows, total });
                    }
                });
            });
        });
    });
};