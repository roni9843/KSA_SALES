const db = require('../database/db');

module.exports = (ipcMain) => {
    // IPC for get-taxes
    ipcMain.handle('get-taxes', async () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tax ORDER BY id DESC`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject('Error loading taxes');
                } else {
                    resolve(rows);
                }
            });
        });
    });

    // IPC for update-tax
    ipcMain.handle('update-tax', async (event, tax) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE tax SET tax_label = ?, tax_percentage = ? WHERE id = ?`;
            const params = [tax.tax_label, tax.tax_percentage, tax.id];
            db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject('Error updating tax');
                } else {
                    resolve({ success: true });
                }
            });
        });
    });

    // IPC for delete-tax
    ipcMain.handle('delete-tax', async (event, id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM tax WHERE id = ?`;
            db.run(sql, [id], function (err) {
                if (err) {
                    console.error(err.message);
                    reject('Error deleting tax');
                } else {
                    resolve({ success: true });
                }
            });
        });
    });
};
