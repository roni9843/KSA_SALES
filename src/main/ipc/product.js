const db = require('../database/db');

module.exports = (ipcMain) => {
  // 🟨 IPC for add-product
  ipcMain.handle('add-product', async (event, product) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO product
        (name, sku, category_id, description, purchase_price, sale_price, quantity_in_stock, unit, tax, markup, code, barcode, active, default_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        product.name,
        product.sku,
        product.category_id,
        product.description,
        product.purchase_price,
        product.sale_price,
        product.quantity_in_stock,
        product.unit,
        product.tax,
        product.markup,
        product.code,
        product.barcode,
        product.active,
        product.default_quantity
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error(err.message);
          reject('Error adding product');
        } else {
          resolve({ success: true, id: this.lastID });
        }
      });
    });
  });

  // IPC for update-product
  ipcMain.handle('update-product', async (event, product) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE product SET
          name = ?,
          sku = ?,
          category_id = ?,
          description = ?,
          purchase_price = ?,
          sale_price = ?,
          quantity_in_stock = ?,
          unit = ?,
          tax = ?,
          markup = ?,
          code = ?,
          barcode = ?,
          active = ?,
          default_quantity = ?
        WHERE id = ?
      `;
      const params = [
        product.name,
        product.sku,
        product.category_id,
        product.description,
        product.purchase_price,
        product.sale_price,
        product.quantity_in_stock,
        product.unit,
        product.tax,
        product.markup,
        product.code,
        product.barcode,
        product.active,
        product.default_quantity,
        product.id
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error(err.message);
          reject('Error updating product');
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  // সব প্রোডাক্ট লোড করার জন্য
  ipcMain.handle('get-products', async () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          p.*,
          c.name as category_name
        FROM product p
        LEFT JOIN product_category c ON p.category_id = c.id
        ORDER BY p.id DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          reject('Error loading products');
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('delete-product', async (_, id) => {
    await db.run(`DELETE FROM product WHERE id = ?`, [id]);
  });

  ipcMain.handle('search-products-for-invoice', async (_, search) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM product
        WHERE (name LIKE ? OR sku LIKE ?)
        AND quantity_in_stock > 0 AND active = 1
      `, [`%${search}%`, `%${search}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  // IPC for searching products
  ipcMain.handle('search-products', async (event, searchTerm) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT * FROM product
      WHERE (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)
      AND active = 1
      ORDER BY name
    `;
        const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject('Error searching products');
            } else {
                resolve(rows);
            }
        });
    });
  });

};
