const db = require('../database/db');

module.exports = (ipcMain) => {
  // Generate stock adjustment ID
  ipcMain.handle('generate-stock-adjustment-id', async () => {
    return new Promise((resolve, reject) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datePrefix = `SA${year}${month}${day}`;

      const sql = `SELECT COUNT(*) as count FROM stock_adjustment WHERE stock_adjustment_no LIKE ?`;
      db.get(sql, [`${datePrefix}%`], (err, row) => {
        if (err) {
          return reject('Error generating stock adjustment ID');
        }
        const count = row.count + 1;
        const sequence = String(count).padStart(4, '0');
        resolve(`${datePrefix}-${sequence}`);
      });
    });
  });

  // Add stock adjustment
  ipcMain.handle('add-stock-adjustment', async (event, adjustmentData) => {
    const { adjustment_no, adjustment_date, adjusted_by, items } = adjustmentData;

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const adjustmentSql = `
          INSERT INTO stock_adjustment (stock_adjustment_no, stock_adjustment_date, stock_adjustment_by)
          VALUES (?, ?, ?)
        `;
        db.run(adjustmentSql, [adjustment_no, adjustment_date, adjusted_by], function (err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const newAdjustmentId = this.lastID;
          const itemSql = `
            INSERT INTO stock_adjustment_item (stock_adjustment_id, product_id, quantity, type, pre_stock, new_stock)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          const updateProductSql = `UPDATE product SET quantity_in_stock = ? WHERE id = ?`;

          const itemPromises = items.map(item => {
            return new Promise((resolveItem, rejectItem) => {
              db.get('SELECT quantity_in_stock FROM product WHERE id = ?', [item.product_id], (err, product) => {
                if (err) return rejectItem(err);

                const pre_stock = product.quantity_in_stock;
                let new_stock;
                if (item.type === 'add') {
                  new_stock = pre_stock + parseFloat(item.quantity);
                } else if (item.type === 'subtract') {
                  new_stock = pre_stock - parseFloat(item.quantity);
                } else {
                    return rejectItem(new Error('Invalid adjustment type'));
                }

                if (new_stock < 0) {
                    return rejectItem(new Error('Stock cannot be negative.'));
                }

                db.run(itemSql, [newAdjustmentId, item.product_id, item.quantity, item.type, pre_stock, new_stock], (err) => {
                  if (err) return rejectItem(err);
                  db.run(updateProductSql, [new_stock, item.product_id], (err) => {
                    if (err) return rejectItem(err);
                    resolveItem();
                  });
                });
              });
            });
          });

          Promise.all(itemPromises)
            .then(() => {
              db.run('COMMIT');
              resolve({ success: true });
            })
            .catch(err => {
              db.run('ROLLBACK');
              reject(err);
            });
        });
      });
    });
  });

  // Get stock adjustments list
  ipcMain.handle('get-stock-adjustments', async (event, { startDate, endDate, page, limit }) => {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      const params = [startDate, endDate];
  
      const countSql = `
        SELECT COUNT(*) as totalCount
        FROM stock_adjustment_item sai
        JOIN stock_adjustment sa ON sai.stock_adjustment_id = sa.id
        WHERE date(sa.stock_adjustment_date) BETWEEN date(?) AND date(?)
      `;
  
      const dataSql = `
        SELECT
          sai.id,
          sa.stock_adjustment_no,
          sa.stock_adjustment_date,
          u.username as adjusted_by,
          p.name as product_name,
          sai.pre_stock,
          CASE sai.type WHEN 'subtract' THEN -sai.quantity ELSE sai.quantity END as quantity,
          sai.new_stock
        FROM stock_adjustment_item sai
        JOIN stock_adjustment sa ON sai.stock_adjustment_id = sa.id
        JOIN users u ON sa.stock_adjustment_by = u.id
        JOIN product p ON sai.product_id = p.id
        WHERE date(sa.stock_adjustment_date) BETWEEN date(?) AND date(?)
        ORDER BY sa.stock_adjustment_date DESC, sai.id DESC
        LIMIT ? OFFSET ?
      `;
      
      const dataParams = [...params, limit, offset];
  
      db.get(countSql, params, (err, countRow) => {
        if (err) {
          return reject(err);
        }
  
        const totalCount = countRow.totalCount;
  
        db.all(dataSql, dataParams, (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve({ rows, totalCount });
        });
      });
    });
  });
};