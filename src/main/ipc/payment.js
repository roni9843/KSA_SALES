const db = require('../database/db');

module.exports = (ipcMain) => {
    ipcMain.handle('get-payment-history', async () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    ph.id,
                    ph.payment_date,
                    ph.paid_amount,
                    ph.due_amount,
                    i.id as invoice_id_pk,
                    i.invoice_id,
                    c.name as customer_name
                FROM
                    customer_payment_history ph
                JOIN
                    invoice i ON ph.invoice_id = i.id
                JOIN
                    customers c ON i.customer_id = c.id
                ORDER BY
                    ph.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
};