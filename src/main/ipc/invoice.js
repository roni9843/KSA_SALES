module.exports = (ipcMain) => {
  const db = require('../database/db');

  ipcMain.handle('get-invoice', async (event, id) => {
    return new Promise((resolve, reject) => {
      const invoiceQuery = `
        SELECT
          i.id,
          i.invoice_id as invoice_number,
          i.created_at,
          i.sub_total,
          i.item_discount,
          i.item_tax,
          i.cart_discount,
          i.payable_total as total,
          i.paid_amount as paid,
          i.due_amount as due,
          c.name as customer_name,
          c.address as customer_address,
          c.phone as customer_phone
        FROM
          invoice i
        LEFT JOIN
          customers c ON i.customer_id = c.id
        WHERE
          i.id = ?
      `;

      const itemsQuery = `
        SELECT
          ii.quantity,
          ii.price as unit_price,
          ii.tax,
          ii.discount,
          ii.total_price,
          p.name as product_name
        FROM
          invoice_item ii
        JOIN
          product p ON ii.product_id = p.id
        WHERE
          ii.invoice_id = ?
      `;

      db.get(invoiceQuery, [id], (err, invoice) => {
        if (err) {
          return reject(err);
        }
        if (!invoice) {
          return reject(new Error('Invoice not found'));
        }

        db.all(itemsQuery, [id], (err, details) => {
          if (err) {
            return reject(err);
          }
          resolve({ invoice, details });
        });
      });
    });
  });

  ipcMain.handle('get-invoices', async () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          i.id,
          i.invoice_id,
          i.payable_total as total,
          i.paid_amount as paid,
          i.due_amount as due,
          i.created_at,
          c.name as customer_name
        FROM
          invoice i
        LEFT JOIN
          customers c ON i.customer_id = c.id
        ORDER BY
          i.id DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Error fetching invoices:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

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

        invoiceStmt.run(invoiceValues, function (err) {
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

          paymentHistoryStmt.run(paymentHistoryValues, function (err) {
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
              itemStmt.run([newInvoiceId, item.product_id, item.quantity, item.price, item.tax, item.discount, item.total_price], function (err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                stockUpdateStmt.run([item.quantity, item.product_id], function (err) {
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

  ipcMain.handle('search-invoices-with-due', async (event, searchTerm) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                i.id,
                i.invoice_id,
                c.name as customer_name
            FROM
                invoice i
            LEFT JOIN
                customers c ON i.customer_id = c.id
            WHERE
                i.due_amount > 0
                AND i.invoice_id LIKE ?
            ORDER BY
                i.id DESC
            LIMIT 10
        `;
        const params = [`%${searchTerm}%`];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error searching invoices with due:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  });

  ipcMain.handle('get-invoice-with-due-details', async (event, invoiceId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                i.id,
                i.invoice_id,
                i.invoice_date,
                i.sub_total,
                i.item_discount,
                i.item_tax,
                i.cart_discount,
                i.payable_total,
                i.paid_amount,
                i.due_amount,
                c.id as customer_id,
                c.name as customer_name,
                c.phone as customer_phone,
                c.address as customer_address
            FROM
                invoice i
            LEFT JOIN
                customers c ON i.customer_id = c.id
            WHERE
                i.id = ?
        `;
        db.get(sql, [invoiceId], (err, row) => {
            if (err) {
                console.error('Error getting invoice details:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
  });

  ipcMain.handle('collect-due-payment', async (event, { invoiceId, paidAmount, paymentMethod, createdBy }) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM invoice WHERE id = ?', [invoiceId], (err, invoice) => {
            if (err) {
                return reject(err);
            }
            if (!invoice) {
                return reject(new Error('Invoice not found'));
            }

            const newPaidAmount = invoice.paid_amount + paidAmount;
            const newDueAmount = invoice.due_amount - paidAmount;
            const changeAmount = newDueAmount < 0 ? Math.abs(newDueAmount) : 0;
            const finalDueAmount = newDueAmount < 0 ? 0 : newDueAmount;
            const now = new Date().toISOString();

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                const updateInvoiceStmt = db.prepare(`
                    UPDATE invoice
                    SET
                        paid_amount = ?,
                        due_amount = ?,
                        updated_at = ?
                    WHERE
                        id = ?
                `);
                updateInvoiceStmt.run([newPaidAmount, finalDueAmount, now, invoiceId], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
                    updateInvoiceStmt.finalize();

                    const paymentHistoryStmt = db.prepare(`
                        INSERT INTO customer_payment_history (
                            invoice_id, payment_date, pre_due_amount, paid_amount, due_amount,
                            change_amount, payment_method, created_by
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    paymentHistoryStmt.run([invoiceId, now, invoice.due_amount, paidAmount, finalDueAmount, changeAmount, paymentMethod, createdBy], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        paymentHistoryStmt.finalize();

                        db.run('COMMIT', (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            resolve({ success: true });
                        });
                    });
                });
            });
        });
    });
  });

  ipcMain.handle('get-last-payment-details', async (event, invoiceId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                ph.payment_date,
                ph.pre_due_amount,
                ph.paid_amount,
                ph.due_amount,
                ph.change_amount,
                i.invoice_id,
                c.name as customer_name,
                c.phone as customer_phone,
                c.address as customer_address
            FROM
                customer_payment_history ph
            JOIN
                invoice i ON ph.invoice_id = i.id
            JOIN
                customers c ON i.customer_id = c.id
            WHERE
                ph.invoice_id = ?
            ORDER BY
                ph.id DESC
            LIMIT 1
        `;
        db.get(sql, [invoiceId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
  });
}