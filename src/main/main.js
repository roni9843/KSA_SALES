const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const { getMachineId } = require('./ipc/system.js');
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
    const expiredWin = new BrowserWindow({ width: 600, height: 400, resizable: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    expiredWin.loadFile(path.join(__dirname, 'expired.html'));
}

function showTimeTamperWindow() {
    const tamperWin = new BrowserWindow({ width: 600, height: 400, resizable: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    tamperWin.loadFile(path.join(__dirname, 'time-tamper.html'));
}

const isTrialExpired = (trialStartDate) => {
    if (!trialStartDate) return true;
    const start = new Date(trialStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 10;
};

async function checkTimeTampering() {
    try {
        const response = await fetch('http://worldtimeapi.org/api/ip');
        if (!response.ok) throw new Error('Failed to fetch world time');
        
        const data = await response.json();
        const trueUtcTime = new Date(data.utc_datetime);
        const systemTime = new Date();

        const tolerance = 5 * 60 * 1000; // 5 minutes tolerance

        if (Math.abs(trueUtcTime - systemTime) > tolerance) {
            console.error(`Significant time discrepancy detected. World time: ${trueUtcTime}, System time: ${systemTime}`);
            return true; // Tampering detected
        }

        const licenseInfo = (await licenseDb.getLicenseInfo()).data;
        if (licenseInfo && licenseInfo.last_successful_validation_date) {
            const lastTrustedTime = new Date(licenseInfo.last_successful_validation_date);
            if (systemTime < lastTrustedTime) {
                console.error('System time is earlier than the last trusted validation time. Tampering detected.');
                return true; // Tampering detected
            }
        }

        return false; // No tampering detected
    } catch (error) {
        console.warn('Could not check for time tampering (maybe offline). Proceeding with caution.', error.message);
        return false; // Fail soft if we can't check
    }
}

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
    if (await checkTimeTampering()) {
        return showTimeTamperWindow();
    }

    let isLicensed = false;
    try {
        await licenseDb.setTrialStartDate();
        const licenseInfo = (await licenseDb.getLicenseInfo()).data;

        if (!licenseInfo) throw new Error('Could not retrieve license info.');

        if (licenseInfo.license_status === 'active') {
            const lastCheck = licenseInfo.last_successful_validation_date;
            if (!lastCheck) {
                isLicensed = false;
                console.log('License requires an initial online validation before offline use.');
            } else {
                const lastCheckDate = new Date(lastCheck);
                const now = new Date();
                const diffDays = Math.ceil((now - lastCheckDate) / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    isLicensed = false;
                    console.log(`Offline grace period of 7 days exceeded. Last check was ${diffDays} days ago.`);
                } else {
                    isLicensed = true;
                }
            }
        } else if (licenseInfo.license_status === 'unlicensed' || !licenseInfo.license_status) {
            if (!isTrialExpired(licenseInfo.trial_start_date)) {
                isLicensed = true;
            }
        }

    } catch (error) {
        console.error('CRITICAL: Could not verify license status during startup.', error);
        isLicensed = false;
    }

    if (isLicensed) {
        console.log('License check passed. Starting application.');
        createWindow();
        setTimeout(revalidateWithServer, 5000);
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