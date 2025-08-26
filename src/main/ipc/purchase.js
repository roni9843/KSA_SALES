const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('add-purchase', async (event, purchaseData) => {
    const { purchase_id, supplier_id, purchase_date, items, grand_total, discount_amount, tax_amount, grand_total_before_tax, supplier_invoice_no, supplier_invoice_date } = purchaseData;

    const purchaseSql = `
    INSERT INTO product_purchase (purchase_id, supplier_id, supplier_invoice_no, supplier_invoice_date, purchase_date, grand_total, grand_total_before_tax, tax_amount, discount_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(purchaseSql, [purchase_id, supplier_id, supplier_invoice_no, supplier_invoice_date, purchase_date, grand_total, grand_total_before_tax, tax_amount, discount_amount], function (err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const new_purchase_id = this.lastID;
          const itemSql = `
          INSERT INTO product_purchase_item (product_purchase_id, product_id, quantity, price, tax_percentage, discount_percentage, total_before_tax, total, pre_stock, new_stock)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
          const updateProductSql = `
          UPDATE product
          SET quantity_in_stock = ?
          WHERE id = ?
        `;

          const itemPromises = items.map(item => {
            return new Promise((resolve, reject) => {
              db.get('SELECT quantity_in_stock FROM product WHERE id = ?', [item.product_id], (err, product) => {
                if (err) {
                  return reject(err);
                }

                const pre_stock = product.quantity_in_stock;
                const new_stock = pre_stock + item.quantity;

                db.run(itemSql, [new_purchase_id, item.product_id, item.quantity, item.price, item.tax_percentage, item.discount_percentage, item.total_before_tax, item.total, pre_stock, new_stock], (err) => {
                  if (err) {
                    return reject(err);
                  }
                  db.run(updateProductSql, [new_stock, item.product_id], (err) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
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

  // IPC for get-purchases
  ipcMain.handle('get-purchases', async () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT
                pp.*,
                s.name as supplier_name
            FROM product_purchase pp
            LEFT JOIN suppliers s ON pp.supplier_id = s.id
            ORDER BY pp.id DESC
        `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          reject('Error loading purchases');
        } else {
          resolve(rows);
        }
      });
    });
  });

  // IPC for update-purchase
  ipcMain.handle('update-purchase', async (event, purchase) => {
    return new Promise((resolve, reject) => {
      const sql = `
            UPDATE product_purchase SET
                supplier_id = ?,
                supplier_invoice_no = ?,
                supplier_invoice_date = ?,
                purchase_date = ?,
                grand_total = ?,
                grand_total_before_tax = ?,
                tax_amount = ?,
                discount_amount = ?
            WHERE id = ?
        `;
      const params = [
        purchase.supplier_id,
        purchase.supplier_invoice_no,
        purchase.supplier_invoice_date,
        purchase.purchase_date,
        purchase.grand_total,
        purchase.grand_total_before_tax,
        purchase.tax_amount,
        purchase.discount_amount,
        purchase.id
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error(err.message);
          reject('Error updating purchase');
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // IPC for delete-purchase
  ipcMain.handle('delete-purchase', async (event, id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM product_purchase WHERE id = ?`, [id], function (err) {
        if (err) {
          console.error(err.message);
          reject('Error deleting purchase');
        } else {
          resolve({ success: true });
        }
      });
    });
  });
};
