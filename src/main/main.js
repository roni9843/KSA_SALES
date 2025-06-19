const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database/db');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    const startUrl = app.isPackaged
        ? `file://${path.join(__dirname, '../../renderer/dist/index.html')}`
        : 'http://localhost:5173';

    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 🟨 IPC for add-category
ipcMain.handle('add-category', async (event, name) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO product_category (name) VALUES (?)`, [name], function (err) {
            if (err) {
                console.error(err.message);
                reject('Error inserting category');
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
});
