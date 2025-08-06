const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('create-invoice', async (event, { invoice, details }) => {
    const { customer_name, total, tax, discount, paid, due, created_at } = invoice;

    const invoiceSql = `
    INSERT INTO invoices (customer_name, total, tax, discount, paid, due, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(invoiceSql, [customer_name, total, tax, discount, paid, due, created_at], function (err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const invoice_id = this.lastID;
          const detailSql = `
          INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, tax, discount, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
          const updateProductSql = `
          UPDATE product
          SET quantity_in_stock = quantity_in_stock - ?
          WHERE id = ?
        `;

          const detailPromises = details.map(item => {
            return new Promise((resolve, reject) => {
              db.run(detailSql, [invoice_id, item.product_id, item.quantity, item.unit_price, item.tax, item.discount, item.total_price], (err) => {
                if (err) {
                  return reject(err);
                }
                db.run(updateProductSql, [item.quantity, item.product_id], (err) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve();
                });
              });
            });
          });

          Promise.all(detailPromises)
            .then(() => {
              db.run('COMMIT');
              resolve(invoice_id);
            })
            .catch(err => {
              db.run('ROLLBACK');
              reject(err);
            });
        });
      });
    });
  });
};
