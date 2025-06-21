const db = require('../database/db');

module.exports = (ipcMain) => {
    ipcMain.handle('add-product', async (_, data) => {
        await db.run(`
      INSERT INTO product (name, sku, category_id, description, purchase_price, sale_price, quantity_in_stock, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            data.name,
            data.sku,
            data.category_id,
            data.description,
            data.purchase_price,
            data.sale_price,
            data.quantity_in_stock,
            data.unit
        ]);
    });

    ipcMain.handle('get-products', async () => {
        return db.all(`
      SELECT p.*, c.name AS category_name
      FROM product p
      LEFT JOIN product_category c ON c.id = p.category_id
    `);
    });

    ipcMain.handle('delete-product', async (_, id) => {
        await db.run(`DELETE FROM product WHERE id = ?`, [id]);
    });

    ipcMain.handle('update-product', async (_, data) => {
        await db.run(`
      UPDATE product SET
        name = ?, sku = ?, category_id = ?, description = ?, purchase_price = ?, sale_price = ?, quantity_in_stock = ?, unit = ?
      WHERE id = ?
    `, [
            data.name,
            data.sku,
            data.category_id,
            data.description,
            data.purchase_price,
            data.sale_price,
            data.quantity_in_stock,
            data.unit,
            data.id
        ]);
    });

    ipcMain.handle('get-categories', async () => {
        return db.all(`SELECT * FROM product_category`);
    });
};
