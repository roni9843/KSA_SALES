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
    const runQuery = (query, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    };

    try {
      const todaysSaleRow = await runQuery(`SELECT SUM(payable_total) as total FROM invoice WHERE date(invoice_date) = date('now')`);
      const todaysPurchaseRow = await runQuery(`SELECT SUM(grand_total) as total FROM product_purchase WHERE date(purchase_date) = date('now')`);
      const availableProductsRow = await runQuery(`SELECT COUNT(*) as count FROM product WHERE quantity_in_stock > 0`);
      const totalCustomerDueRow = await runQuery(`SELECT SUM(due_amount) as total FROM invoice`);
      const todaysProfitRow = await runQuery(`
        SELECT SUM((ii.price - p.purchase_price) * ii.quantity) as profit
        FROM invoice_item ii
        JOIN product p ON ii.product_id = p.id
        JOIN invoice i ON ii.invoice_id = i.id
        WHERE date(i.invoice_date) = date('now')
      `);
      const totalCustomersRow = await runQuery(`SELECT COUNT(*) as count FROM customers`);
      const totalSuppliersRow = await runQuery(`SELECT COUNT(*) as count FROM suppliers`);
      const totalDueInvoicesRow = await runQuery(`SELECT COUNT(*) as count FROM invoice WHERE due_amount > 0`);
      const todaysTotalInvoicesRow = await runQuery(`SELECT COUNT(*) as count FROM invoice WHERE date(invoice_date) = date('now')`);
      const todaysTotalPurchasesRow = await runQuery(`SELECT COUNT(*) as count FROM product_purchase WHERE date(purchase_date) = date('now')`);

      return {
        todaysSale: todaysSaleRow.total || 0,
        todaysPurchase: todaysPurchaseRow.total || 0,
        availableProducts: availableProductsRow.count || 0,
        totalCustomerDue: totalCustomerDueRow.total || 0,
        todaysProfit: todaysProfitRow.profit || 0,
        totalCustomers: totalCustomersRow.count || 0,
        totalSuppliers: totalSuppliersRow.count || 0,
        totalDueInvoices: totalDueInvoicesRow.count || 0,
        todaysTotalInvoices: todaysTotalInvoicesRow.count || 0,
        todaysTotalPurchases: todaysTotalPurchasesRow.count || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  });

  ipcMain.handle('get-recent-invoices', async () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          i.id,
          i.invoice_id,
          i.payable_total,
          i.due_amount,
          c.name as customer_name
        FROM invoice i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.id DESC
        LIMIT 5
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        const invoices = rows.map(row => ({
          id: row.invoice_id,
          customer: row.customer_name,
          amount: `${row.payable_total.toFixed(2)}`,
          status: row.due_amount > 0 ? 'Overdue' : 'Paid'
        }));
        resolve(invoices);
      });
    });
  });

  ipcMain.handle('get-top-selling-products', async () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          p.name,
          SUM(ii.quantity) as total_quantity
        FROM invoice_item ii
        JOIN product p ON ii.product_id = p.id
        JOIN invoice i ON ii.invoice_id = i.id
        WHERE date(i.invoice_date) >= date('now', '-6 days')
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT 5
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  });
};
