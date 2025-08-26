const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('get-product-sales-report', async (event, { productId, startDate, endDate }) => {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT
          i.invoice_id,
          i.invoice_date,
          ii.quantity,
          ii.price,
          ii.total_price
        FROM invoice_item ii
        JOIN invoice i ON ii.invoice_id = i.id
        WHERE ii.product_id = ?
      `;
      const params = [productId];

      if (startDate && endDate) {
        sql += ` AND date(i.invoice_date) BETWEEN date(?) AND date(?)`;
        params.push(startDate, endDate);
      } else {
        // If no date range, default to today
        sql += ` AND date(i.invoice_date) = date('now')`;
      }

      sql += ` ORDER BY i.invoice_date DESC`;

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error fetching product sales report:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
};
