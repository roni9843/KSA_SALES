const db = require('../database/db');

module.exports = (ipcMain) => {
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
