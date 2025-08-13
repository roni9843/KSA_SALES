module.exports = (ipcMain) => {
  const db = require('../database/db');

  ipcMain.handle('create-invoice', async (event, invoiceData) => {
    return new Promise((resolve, reject) => {
      const {
        customer_id,
        invoice_date,
        sub_total,
        item_discount,
        item_tax,
        cart_discount,
        payable_total,
        paid_amount,
        due_amount,
        change_amount,
        created_by,
        invoice_items
      } = invoiceData;

      const invoice_id = `INV-${Date.now()}`;
      const now = new Date().toISOString();

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const invoiceStmt = db.prepare(`
          INSERT INTO invoice (
            invoice_id, customer_id, invoice_date, sub_total, item_discount,
            item_tax, cart_discount, payable_total, paid_amount, due_amount,
            created_at, updated_at, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const invoiceValues = [
          invoice_id,
          customer_id || 1, // Default to 'Walk-in Customer'
          invoice_date,
          sub_total,
          item_discount,
          item_tax,
          cart_discount,
          payable_total,
          paid_amount,
          due_amount,
          now,
          now,
          created_by
        ];

        invoiceStmt.run(invoiceValues, function(err) {
          if (err) {
            db.run('ROLLBACK');
            console.error('Error inserting invoice:', err.message);
            return reject(err);
          }

          const newInvoiceId = this.lastID;

          // Insert into customer_payment_history
          const paymentHistoryStmt = db.prepare(`
            INSERT INTO customer_payment_history (
              invoice_id, payment_date, pre_due_amount, paid_amount, due_amount, 
              change_amount, payment_method, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const paymentHistoryValues = [
            newInvoiceId,
            now,
            payable_total, // pre_due_amount is the total before this payment
            paid_amount,
            due_amount,
            change_amount,
            'Cash', // Assuming Cash, as it's not captured in UI
            created_by
          ];

          paymentHistoryStmt.run(paymentHistoryValues, function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error inserting payment history:', err.message);
              return reject(err);
            }
            paymentHistoryStmt.finalize();

            // Process invoice items
            const itemStmt = db.prepare(`
              INSERT INTO invoice_item (
                invoice_id, product_id, quantity, price, tax, discount, total_price
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const stockUpdateStmt = db.prepare(
              'UPDATE product SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?'
            );

            let itemsProcessed = 0;
            if (invoice_items.length === 0) {
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                resolve(newInvoiceId);
              });
              return;
            }

            invoice_items.forEach(item => {
              itemStmt.run([newInvoiceId, item.product_id, item.quantity, item.price, item.tax, item.discount, item.total_price], function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                stockUpdateStmt.run([item.quantity, item.product_id], function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }

                  itemsProcessed++;
                  if (itemsProcessed === invoice_items.length) {
                    itemStmt.finalize();
                    stockUpdateStmt.finalize();
                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                      }
                      resolve(newInvoiceId);
                    });
                  }
                });
              });
            });
          });
        });
        invoiceStmt.finalize();
      });
    });
  });
}