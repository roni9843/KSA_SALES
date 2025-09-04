const db = require('../database/db');

module.exports = function(ipcMain) {
    // settings
    ipcMain.handle('get-settings', async () => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM settings WHERE id = ?`, [1], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject('Error reading settings');
                } else {
                    resolve(row);
                }
            });
        });
    });

    ipcMain.handle('update-settings', async (event, settings) => {
        return new Promise((resolve, reject) => {
            const sql = `
            UPDATE settings
            SET language = ?, writing_direction = ?, color_scheme = ?, shop_name = ?, shop_address = ?, shop_phone = ?, shop_email = ?, shop_logo = ?
            WHERE id = ?
        `;
            const params = [
                settings.language,
                settings.writing_direction,
                settings.color_scheme,
                settings.shop_name,
                settings.shop_address,
                settings.shop_phone,
                settings.shop_email,
                settings.shop_logo,
                1
            ];
            db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject('Error updating settings');
                } else {
                    resolve({ success: true });
                }
            });
        });
    });
};
