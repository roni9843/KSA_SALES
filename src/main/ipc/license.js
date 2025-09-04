const { ipcMain } = require('electron');
const db = require('../database/db');

// Helper functions to interact with the database
const getLicenseInfoFromDb = () => {
    return new Promise((resolve, reject) => {
        // Also fetch the new grace period column
        db.get(`SELECT trial_start_date, license_key, subscription_end_date, license_status, last_successful_validation_date FROM settings WHERE id = 1`, [], (err, row) => {
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

const updateLicenseSettingsInDb = (settings) => {
    return new Promise((resolve, reject) => {
        const fields = [];
        const params = [];
        
        const keyMap = {
            licenseKey: 'license_key',
            subscriptionEndDate: 'subscription_end_date',
            licenseStatus: 'license_status',
            lastSuccessfulValidationDate: 'last_successful_validation_date'
        };

        for (const key in settings) {
            if (keyMap[key] && settings[key] !== undefined) {
                fields.push(`${keyMap[key]} = ?`);
                params.push(settings[key]);
            }
        }

        if (fields.length === 0) {
            return resolve({ success: true, changes: 0, message: 'No fields to update.' });
        }

        params.push(1); // for WHERE id = ?
        const sql = `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`;

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error updating license settings:', err.message);
                reject({ success: false, message: 'Error updating license settings.' });
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

    // This handler is now simpler, as it just calls the generic update function
    ipcMainInstance.handle('activate-license', async (event, { licenseKey, subscriptionEndDate }) => {
        return updateLicenseSettingsInDb({
            licenseKey,
            subscriptionEndDate,
            licenseStatus: 'active',
            lastSuccessfulValidationDate: new Date().toISOString() // Also set validation date on activation
        });
    });
};

// Export both the registration function and the direct access functions
module.exports = registerLicenseIpcHandlers;
module.exports.getLicenseInfo = getLicenseInfoFromDb;
module.exports.setTrialStartDate = setTrialStartDateInDb;
module.exports.updateLicenseSettings = updateLicenseSettingsInDb;