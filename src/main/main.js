const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const { getMachineId } = require('./ipc/system.js'); // Assuming system.js exports this
const licenseDb = require('./ipc/license.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    const startUrl = app.isPackaged
        ? `file://${path.join(__dirname, '../../renderer/dist/index.html')}`
        : 'http://localhost:5173';

    win.loadURL(startUrl);
}

function showExpiredWindow() {
    const expiredWin = new BrowserWindow({
        width: 600,
        height: 400,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    expiredWin.loadFile(path.join(__dirname, 'expired.html'));
}

const isTrialExpired = (trialStartDate) => {
    if (!trialStartDate) return true;
    const start = new Date(trialStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 10;
};

async function revalidateWithServer() {
    console.log('Performing periodic license re-validation with server...');
    try {
        const localLicenseResult = await licenseDb.getLicenseInfo();
        const localLicense = localLicenseResult.data;

        if (!localLicense || !localLicense.license_key) {
            console.log('No local license key found. Skipping re-validation.');
            return;
        }

        const machineId = getMachineId();
        const validationUrl = 'https://araflogix.com/motopos_backend/api/license/validate.php';

        const response = await fetch(validationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                licenseKey: localLicense.license_key,
                machineId: machineId
            })
        });

        if (!response.ok) {
            console.log(`Server validation failed with status: ${response.status}. Updating local license to expired.`);
            await licenseDb.updateLicenseSettings({ licenseStatus: 'expired' });
            return;
        }

        const serverResult = await response.json();
        if (serverResult.success) {
            const serverLicense = serverResult.data;
            console.log('Successfully re-validated with server. Updating local data.');
            await licenseDb.updateLicenseSettings({
                licenseStatus: serverLicense.status,
                subscriptionEndDate: serverLicense.subscriptionEndDate,
                lastSuccessfulValidationDate: new Date().toISOString()
            });
        } else {
            console.log('Server responded that license is invalid. Updating local status.');
            await licenseDb.updateLicenseSettings({ licenseStatus: 'expired' });
        }
    } catch (error) {
        console.error('Could not connect to validation server for re-validation. App will rely on local license data.', error.message);
    }
}

app.whenReady().then(async () => {
    let isLicensed = false;
    try {
        await licenseDb.setTrialStartDate();
        const licenseInfoResult = await licenseDb.getLicenseInfo();
        const licenseInfo = licenseInfoResult.data;

        if (!licenseInfo) throw new Error('Could not retrieve license info.');

        // 1. Check offline grace period
        if (licenseInfo.license_status === 'active') {
            const lastCheck = licenseInfo.last_successful_validation_date;
            if (!lastCheck) {
                isLicensed = false; // Has an active license but has never validated. Force online.
                console.log('License requires an initial online validation.');
            } else {
                const lastCheckDate = new Date(lastCheck);
                const now = new Date();
                const diffTime = Math.abs(now - lastCheckDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    isLicensed = false; // Offline for too long
                    console.log(`Offline grace period of 7 days exceeded. Last check was ${diffDays} days ago.`);
                }
            }
        }

        // 2. If grace period is fine, check license status
        if (licenseInfo.license_status === 'active') {
            isLicensed = true;
        } else if (licenseInfo.license_status === 'unlicensed' || !licenseInfo.license_status) {
            if (!isTrialExpired(licenseInfo.trial_start_date)) {
                isLicensed = true; // Trial is active
            }
        }

    } catch (error) {
        console.error('CRITICAL: Could not verify license status during startup.', error);
        isLicensed = false;
    }

    if (isLicensed) {
        console.log('License check passed. Starting application.');
        createWindow();
        setTimeout(revalidateWithServer, 5000); // Re-validate 5 seconds after launch
    } else {
        console.log('License check failed. Displaying expiry screen.');
        showExpiredWindow();
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
require('./ipc/system.js')(ipcMain);
require('./ipc/tax.js')(ipcMain);
require('./ipc/transaction.js')(ipcMain);
require('./ipc/users.js')(ipcMain);