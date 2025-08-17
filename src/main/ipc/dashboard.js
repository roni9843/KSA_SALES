const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('get-weekly-summary', async () => {
    const salesQuery = `
      SELECT
        date(invoice_date) as day,
        SUM(payable_total) as total_sales
      FROM invoice
      WHERE date(invoice_date) >= date('now', '-6 days')
      GROUP BY day
    `;

    const purchasesQuery = `
      SELECT
        date(purchase_date) as day,
        SUM(grand_total) as total_purchases
      FROM product_purchase
      WHERE date(purchase_date) >= date('now', '-6 days')
      GROUP BY day
    `;

    return new Promise((resolve, reject) => {
      db.all(salesQuery, [], (err, salesRows) => {
        if (err) return reject(err);

        db.all(purchasesQuery, [], (err, purchaseRows) => {
          if (err) return reject(err);

          const summary = {};
          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayKey = d.toISOString().split('T')[0];
            summary[dayKey] = {
              name: weekDays[d.getDay()],
              sales: 0,
              purchases: 0,
            };
          }

          salesRows.forEach(row => {
            if (summary[row.day]) {
              summary[row.day].sales = row.total_sales;
            }
          });

          purchaseRows.forEach(row => {
            if (summary[row.day]) {
              summary[row.day].purchases = row.total_purchases;
            }
          });

          resolve(Object.values(summary));
        });
      });
    });
  });

  ipcMain.handle('get-dashboard-data', async () => {
    const today = new Date().toISOString().slice(0, 10);

    const getTodaysSale = new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(paid_amount) as total FROM invoice WHERE invoice_date LIKE ?`,
        [`${today}%`],
        (err, row) => {
          if (err) reject(err);
          resolve(row?.total || 0);
        }
      );
    });

    const getTodaysPurchase = new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(grand_total) as total FROM product_purchase WHERE purchase_date LIKE ?`,
        [`${today}%`],
        (err, row) => {
          if (err) reject(err);
          resolve(row?.total || 0);
        }
      );
    });

    const getAvailableProducts = new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM product WHERE quantity_in_stock > 0`,
        (err, row) => {
          if (err) reject(err);
          resolve(row?.count || 0);
        }
      );
    });

    const getTotalCustomerDue = new Promise((resolve, reject) => {
      db.get(`SELECT SUM(due_amount) as total FROM invoice`, (err, row) => {
        if (err) reject(err);
        resolve(row?.total || 0);
      });
    });

    const getTodaysProfit = new Promise((resolve, reject) => {
        const query = `
            SELECT
                SUM((ii.price - p.purchase_price) * ii.quantity) as profit
            FROM invoice_item ii
            JOIN product p ON ii.product_id = p.id
            JOIN invoice i ON ii.invoice_id = i.id
            WHERE i.invoice_date LIKE ?
        `;
        db.get(query, [`${today}%`], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row?.profit || 0);
            }
        });
    });

    try {
      const [todaysSale, todaysPurchase, availableProducts, totalCustomerDue, todaysProfit] = await Promise.all([
        getTodaysSale,
        getTodaysPurchase,
        getAvailableProducts,
        getTotalCustomerDue,
        getTodaysProfit
      ]);

      return {
        todaysSale,
        todaysPurchase,
        availableProducts,
        totalCustomerDue,
        todaysProfit
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { error: error.message };
    }
  });
};
