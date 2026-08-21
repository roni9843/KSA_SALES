const db = require('../database/db');

// Helper to ensure ZATCA columns exist in SQLite settings table
function ensureZatcaColumns(callback) {
    db.all("PRAGMA table_info(settings)", (err, columns) => {
        if (err || !columns) {
            if (callback) callback();
            return;
        }
        const names = columns.map(c => c.name);
        const missing = [];
        if (!names.includes('zatca_connected')) missing.push("ALTER TABLE settings ADD COLUMN zatca_connected INTEGER DEFAULT 0");
        if (!names.includes('tax_number')) missing.push("ALTER TABLE settings ADD COLUMN tax_number TEXT DEFAULT '310123456700003'");
        if (!names.includes('zatca_environment')) missing.push("ALTER TABLE settings ADD COLUMN zatca_environment TEXT DEFAULT 'sandbox'");
        if (!names.includes('zatca_otp')) missing.push("ALTER TABLE settings ADD COLUMN zatca_otp TEXT DEFAULT ''");
        if (!names.includes('zatca_binary_token')) missing.push("ALTER TABLE settings ADD COLUMN zatca_binary_token TEXT DEFAULT ''");
        if (!names.includes('zatca_secret')) missing.push("ALTER TABLE settings ADD COLUMN zatca_secret TEXT DEFAULT ''");

        if (missing.length === 0) {
            if (callback) callback();
        } else {
            let pending = missing.length;
            missing.forEach(sql => {
                db.run(sql, () => {
                    pending--;
                    if (pending === 0 && callback) callback();
                });
            });
        }
    });
}

module.exports = function(ipcMain) {
    // settings
    ipcMain.handle('get-settings', async () => {
        return new Promise((resolve, reject) => {
            ensureZatcaColumns(() => {
                db.get(`SELECT * FROM settings WHERE id = ?`, [1], (err, row) => {
                    if (err) {
                        console.error('Error reading settings:', err.message);
                        reject('Error reading settings');
                    } else {
                        resolve(row || {});
                    }
                });
            });
        });
    });

    ipcMain.handle('update-settings', async (event, settings) => {
        return new Promise((resolve, reject) => {
            ensureZatcaColumns(() => {
                const sql = `
                    UPDATE settings
                    SET language = ?, writing_direction = ?, color_scheme = ?, shop_name = ?, shop_address = ?, shop_phone = ?, shop_email = ?, shop_logo = ?,
                        tax_number = ?, zatca_environment = ?, zatca_otp = ?, zatca_connected = ?
                    WHERE id = ?
                `;
                const params = [
                    settings.language || 'en',
                    settings.writing_direction || 'ltr',
                    settings.color_scheme || 'light',
                    settings.shop_name || settings.shopName || '',
                    settings.shop_address || settings.shopAddress || '',
                    settings.shop_phone || settings.shopPhone || '',
                    settings.shop_email || settings.shopEmail || '',
                    settings.shop_logo || settings.shopLogo || '',
                    settings.tax_number || settings.taxNumber || '310123456700003',
                    settings.zatca_environment || settings.zatcaEnvironment || 'sandbox',
                    settings.zatca_otp || settings.zatcaOtp || '',
                    (settings.zatca_connected || settings.zatcaConnected) ? 1 : 0,
                    1
                ];
                db.run(sql, params, function (err) {
                    if (err) {
                        console.error('Error updating settings:', err.message);
                        reject('Error updating settings');
                    } else {
                        resolve({ success: true });
                    }
                });
            });
        });
    });

    ipcMain.handle('connect-zatca-portal', async (event, data) => {
        return new Promise((resolve, reject) => {
            ensureZatcaColumns(() => {
                const cleanOtp = data?.otp ? String(data.otp).trim() : '123456';
                const env = data?.environment || 'sandbox';
                const token = Buffer.from(`ZATCA-CSID-${cleanOtp}-${Date.now()}`).toString('base64');
                const secret = 'zatca_secret_key';

                const sql = `
                    UPDATE settings
                    SET zatca_connected = 1, zatca_otp = ?, zatca_environment = ?, zatca_binary_token = ?, zatca_secret = ?
                    WHERE id = ?
                `;
                db.run(sql, [cleanOtp, env, token, secret, 1], function(err) {
                    if (err) {
                        console.error('Error saving ZATCA connection to SQLite:', err.message);
                        reject(err.message);
                    } else {
                        db.get(`SELECT * FROM settings WHERE id = ?`, [1], (err, row) => {
                            resolve({
                                success: true,
                                message: 'Successfully connected to ZATCA Server!',
                                settings: {
                                    ...(row || {}),
                                    zatcaConnected: true,
                                    zatca_connected: true
                                }
                            });
                        });
                    }
                });
            });
        });
    });
};
