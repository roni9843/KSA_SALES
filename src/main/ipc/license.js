const { ipcMain } = require('electron');
const db = require('../database/db');

// Helper functions to interact with the database
const getLicenseInfoFromDb = () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT trial_start_date, license_key, subscription_end_date, license_status FROM settings WHERE id = 1`, [], (err, row) => {
            if (err) {
                console.error('Error getting license info from DB:', err.message);
                reject({ success: false, message: 'Error getting license info from DB.' });
            } else {
                resolve({ success: true, data: row });
            }
        });
    });
};

const setTrialStartDateInDb = () => {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db.run(`UPDATE settings SET trial_start_date = ? WHERE id = 1 AND trial_start_date IS NULL`, [now], function (err) {
            if (err) {
                console.error('Error setting trial start date in DB:', err.message);
                reject({ success: false, message: 'Error setting trial start date in DB.' });
            } else {
                resolve({ success: true, changes: this.changes });
            }
        });
    });
};

// Function to register IPC handlers
const registerLicenseIpcHandlers = (ipcMainInstance) => {
    ipcMainInstance.handle('get-license-info', async () => {
        return getLicenseInfoFromDb();
    });

    ipcMainInstance.handle('set-trial-start-date', async () => {
        return setTrialStartDateInDb();
    });

    // Future: Activate license (for paid subscriptions)
    ipcMainInstance.handle('activate-license', async (event, { licenseKey, subscriptionEndDate }) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE settings SET license_key = ?, subscription_end_date = ?, license_status = 'active' WHERE id = 1`, [licenseKey, subscriptionEndDate], function (err) {
                if (err) {
                    console.error('Error activating license:', err.message);
                    reject({ success: false, message: 'Error activating license.' });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    });
};

// Export both the registration function and the direct access functions
module.exports = registerLicenseIpcHandlers;
module.exports.getLicenseInfo = getLicenseInfoFromDb;
module.exports.setTrialStartDate = setTrialStartDateInDb;