const db = require('../database/db');

module.exports = (ipcMain) => {
    ipcMain.handle('get-product-transactions', async (event, { productId, startDate, endDate, page = 1, limit = 10 }) => {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;

            const salesQuery = `
                SELECT
                    i.invoice_date as date,
                    'Sale' as type,
                    i.invoice_id as id,
                    -ii.quantity as quantity,
                    ii.pre_stock,
                    ii.new_stock
                FROM invoice_item ii
                JOIN invoice i ON ii.invoice_id = i.id
                WHERE ii.product_id = ? AND date(i.invoice_date) BETWEEN date(?) AND date(?)
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
                WHERE ppi.product_id = ? AND date(pp.purchase_date) BETWEEN date(?) AND date(?)
            `;

            const stockAdjustmentQuery = `
                SELECT
                    sa.stock_adjustment_date as date,
                    'Stock Adj.' as type,
                    sa.stock_adjustment_no as id,
                    CASE sai.type WHEN 'subtract' THEN -sai.quantity ELSE sai.quantity END as quantity,
                    sai.pre_stock,
                    sai.new_stock
                FROM stock_adjustment_item sai
                JOIN stock_adjustment sa ON sai.stock_adjustment_id = sa.id
                WHERE sai.product_id = ? AND date(sa.stock_adjustment_date) BETWEEN date(?) AND date(?)
            `;

            const combinedQuery = `
                SELECT * FROM (
                    ${salesQuery.replace(/\n/g, ' ' )}
                    UNION ALL
                    ${purchaseQuery.replace(/\n/g, ' ' )}
                    UNION ALL
                    ${stockAdjustmentQuery.replace(/\n/g, ' ' )}
                )
                ORDER BY date DESC, id DESC
                LIMIT ? OFFSET ?
            `;

            const countQuery = `
                SELECT COUNT(*) as totalCount FROM (
                    ${salesQuery.replace(/\n/g, ' ' )}
                    UNION ALL
                    ${purchaseQuery.replace(/\n/g, ' ' )}
                    UNION ALL
                    ${stockAdjustmentQuery.replace(/\n/g, ' ' )}
                )
            `;

            const params = [productId, startDate, endDate, productId, startDate, endDate, productId, startDate, endDate];

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