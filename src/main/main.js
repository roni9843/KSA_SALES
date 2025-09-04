const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database/db');
const licenseModule = require('./ipc/license.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false, // এটাকে অবশ্যই false রাখতে হবে
        },
    });

    const startUrl = app.isPackaged
        ? `file://${path.join(__dirname, '../../renderer/dist/index.html')}`
        : 'http://localhost:5173';

    win.loadURL(startUrl);
}

const isTrialExpired = (trialStartDate) => {
    if (!trialStartDate) return true; // If there's no start date, treat as expired
    const start = new Date(trialStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 10; // 10-day trial
};

app.whenReady().then(async () => {
    // --- License Check Logic ---
    let isLicensed = false;
    try {
        // 1. Set trial start date on first run
        await licenseModule.setTrialStartDate();

        // 2. Get the latest license info
        const licenseInfoResult = await licenseModule.getLicenseInfo();
        if (licenseInfoResult.success) {
            const licenseInfo = licenseInfoResult.data;
            console.log('Current license status:', licenseInfo.license_status);

            // 3. Determine license validity
            if (licenseInfo.license_status === 'active') {
                isLicensed = true; // Active subscription, always allow
            } else if (licenseInfo.license_status === 'unlicensed' || !licenseInfo.license_status) {
                // In trial period
                if (!isTrialExpired(licenseInfo.trial_start_date)) {
                    isLicensed = true;
                }
            }
            // Any other status ('expired', etc.) will result in isLicensed = false
        }
    } catch (error) {
        console.error('CRITICAL: Could not verify license status.', error);
        // Default to not licensed if any error occurs during the check
        isLicensed = false;
    }

    // 4. Open the appropriate window
    if (isLicensed) {
        console.log('License check passed. Starting application.');
        createWindow();
    } else {
        console.log('License check failed (Expired or Error). Displaying expiry screen.');
        const expiredWin = new BrowserWindow({
            width: 600,
            height: 400,
            resizable: false,
            webPreferences: {
                nodeIntegration: true, // Keep as is for simple HTML page
                contextIsolation: false,
            }
        });
        expiredWin.loadFile(path.join(__dirname, 'expired.html'));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Register IPC Handlers
require('./ipc/auth.js')(ipcMain);
require('./ipc/category.js')(ipcMain);
require('./ipc/customer.js')(ipcMain);
require('./ipc/dashboard.js')(ipcMain);
require('./ipc/database.js')(ipcMain);
require('./ipc/invoice.js')(ipcMain);
require('./ipc/license.js')(ipcMain);
require('./ipc/payment.js')(ipcMain);
require('./ipc/permissions.js')(ipcMain);
require('./ipc/product.js')(ipcMain);
require('./ipc/purchase.js')(ipcMain);
require('./ipc/reporting.js')(ipcMain);
require('./ipc/roles.js')(ipcMain);
require('./ipc/settings.js')(ipcMain);
require('./ipc/stock.js')(ipcMain);
require('./ipc/supplier.js')(ipcMain);
require('./ipc/system.js')(ipcMain); // <-- Add this line
require('./ipc/tax.js')(ipcMain);
require('./ipc/transaction.js')(ipcMain);
require('./ipc/users.js')(ipcMain);
