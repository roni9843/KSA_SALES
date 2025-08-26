const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('get-product-sales-report', async (event, { productId, startDate, endDate, page = 1, limit = 5 }) => {
    const offset = (page - 1) * limit;

    let countSql = `SELECT COUNT(*) as count FROM invoice_item ii JOIN invoice i ON ii.invoice_id = i.id WHERE ii.product_id = ?`;
    const params = [productId];

    if (startDate && endDate) {
      countSql += ` AND date(i.invoice_date) BETWEEN date(?) AND date(?)`;
      params.push(startDate, endDate);
    } else {
      // This logic was fetching only today's data by default.
      // To make pagination work correctly, we should count all records for the product if no date is specified.
      // However, the original request implies a default of today. Let's stick to that for now.
      countSql += ` AND date(i.invoice_date) = date('now')`;
    }

    let dataSql = `
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

    if (startDate && endDate) {
      dataSql += ` AND date(i.invoice_date) BETWEEN date(?) AND date(?)`;
    } else {
      dataSql += ` AND date(i.invoice_date) = date('now')`;
    }

    dataSql += ` ORDER BY i.invoice_date DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];

    return new Promise((resolve, reject) => {
      db.get(countSql, params, (err, row) => {
        if (err) {
          console.error('Error counting product sales report:', err.message);
          return reject(err);
        }

        const totalCount = row.count;

        db.all(dataSql, dataParams, (err, rows) => {
          if (err) {
            console.error('Error fetching product sales report data:', err.message);
            return reject(err);
          }
          resolve({ rows, totalCount });
        });
      });
    });
  });
};