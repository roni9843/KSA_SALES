const { ipcMain } = require('electron');
const db = require('../database/db');

ipcMain.handle('add-purchase', async (event, purchaseData) => {
  const { supplier_id, purchase_date, items, grand_total, discount_amount, tax_amount, grand_total_before_tax } = purchaseData;

  const purchaseSql = `
    INSERT INTO product_purchase (purchase_id, supplier_id, purchase_date, grand_total, grand_total_before_tax, tax_amount, discount_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const today = new Date().toISOString().slice(0, 10);
  const purchaseId = `P${today.replace(/-/g, '')}`;

  return new Promise((resolve, reject) => {
    db.run(purchaseSql, [purchaseId, supplier_id, purchase_date, grand_total, grand_total_before_tax, tax_amount, discount_amount], function (err) {
      if (err) {
        reject(err);
      } else {
        const purchaseId = this.lastID;
        const itemSql = `
          INSERT INTO product_purchase_item (product_purchase_id, product_id, quantity, price, tax_percentage, total_before_tax, total)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.run(itemSql, [purchaseId, item.productId, item.quantity, item.price, item.tax, item.total, item.total], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(itemPromises)
          .then(() => resolve({ success: true }))
          .catch(err => reject(err));
      }
    });
  });
});