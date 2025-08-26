const db = require('../database/db');

module.exports = (ipcMain) => {
    ipcMain.handle('get-product-transactions', async (event, { productId, startDate, endDate, page = 1, limit = 25 }) => {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;

            const salesQuery = `
                SELECT
                    i.invoice_date as date,
                    'Sale' as type,
                    i.invoice_id as id,
                    ii.quantity,
                    ii.pre_stock,
                    ii.new_stock
                FROM invoice_item ii
                JOIN invoice i ON ii.invoice_id = i.id
                WHERE ii.product_id = ? AND i.invoice_date BETWEEN ? AND ?
            `;

            const purchaseQuery = `
                SELECT
                    pp.purchase_date as date,
                    'Purchase' as type,
                    pp.purchase_id as id,
                    ppi.quantity,
                    ppi.pre_stock,
                    ppi.new_stock
                FROM product_purchase_item ppi
                JOIN product_purchase pp ON ppi.product_purchase_id = pp.id
                WHERE ppi.product_id = ? AND pp.purchase_date BETWEEN ? AND ?
            `;

            const combinedQuery = `
                SELECT * FROM (
                    ${salesQuery.replace(/\n/g, ' ')}
                    UNION ALL
                    ${purchaseQuery.replace(/\n/g, ' ')}
                )
                ORDER BY date DESC
                LIMIT ? OFFSET ?
            `;

            const countQuery = `
                SELECT COUNT(*) as totalCount FROM (
                    ${salesQuery.replace(/\n/g, ' ')}
                    UNION ALL
                    ${purchaseQuery.replace(/\n/g, ' ')}
                )
            `;

            const params = [productId, startDate, endDate, productId, startDate, endDate];

            const dataPromise = new Promise((resolve, reject) => {
                db.all(combinedQuery, [...params, limit, offset], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            const countPromise = new Promise((resolve, reject) => {
                db.get(countQuery, params, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.totalCount);
                    }
                });
            });

            Promise.all([dataPromise, countPromise])
                .then(([rows, totalCount]) => {
                    resolve({ rows, totalCount });
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
}
