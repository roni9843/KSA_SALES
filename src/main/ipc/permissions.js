const db = require('../database/db');

module.exports = (ipcMain) => {
  ipcMain.handle('get-permissions', async () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM permissions ORDER BY id DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Error loading permissions:', err.message);
          reject('Error loading permissions');
        } else {
          resolve(rows);
        }
      });
    });
  });
};