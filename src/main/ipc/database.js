const { ipcMain, dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('../database/db'); // Import the database connection

// The path to the official database file
const dbPath = path.join(app.getAppPath(), 'src', 'main', 'database', 'moto_pos.db');

module.exports = (ipcMain) => {
    // --- EXPORT DATABASE --- //
    ipcMain.handle('export-database', async () => {
        try {
            const { filePath } = await dialog.showSaveDialog({
                title: 'Export Database',
                defaultPath: `moto_pos_backup_${Date.now()}.db`,
                filters: [
                    { name: 'Database Files', extensions: ['db'] },
                    { name: 'All Files', extensions: ['*'] },
                ]
            });

            if (filePath) {
                fs.copyFileSync(dbPath, filePath);
                return { success: true, message: 'Database exported successfully!' };
            }
            return { success: false, message: 'Export cancelled.' };
        } catch (error) {
            console.error('Failed to export database:', error);
            return { success: false, message: `Failed to export database: ${error.message}` };
        }
    });

    // --- IMPORT DATABASE --- //
    ipcMain.handle('import-database', async () => {
        try {
            const { filePaths } = await dialog.showOpenDialog({
                title: 'Import Database',
                properties: ['openFile'],
                filters: [
                    { name: 'Database Files', extensions: ['db'] },
                ]
            });

            if (filePaths && filePaths.length > 0) {
                const backupPath = filePaths[0];

                // 1. Close the existing database connection
                await new Promise((resolve, reject) => {
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                            return reject(new Error('Could not close the current database. Import failed.'));
                        }
                        console.log('Database connection closed.');
                        resolve();
                    });
                });

                // 2. Replace the database file
                fs.copyFileSync(backupPath, dbPath);

                // 3. Relaunch the application
                app.relaunch();
                app.exit();

                return { success: true }; // This might not be received by the frontend due to restart
            }
            return { success: false, message: 'Import cancelled.' };

        } catch (error) {
            console.error('Failed to import database:', error);
            return { success: false, message: `Failed to import database: ${error.message}` };
        }
    });
};