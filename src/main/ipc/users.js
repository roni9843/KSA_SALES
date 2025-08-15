const db = require('../database/db');
const bcrypt = require('bcrypt');

module.exports = (ipcMain) => {
  // Get all users
  ipcMain.handle('get-users', async () => {
    return new Promise((resolve, reject) => {
      // Exclude password from the result
      db.all(`SELECT id, username FROM users ORDER BY username`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  // Add a new user
  ipcMain.handle('add-user', async (event, { username, password }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const hash = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      } catch (err) {
        reject(err);
      }
    });
  });

  // Get roles for a specific user
  ipcMain.handle('get-user-roles', async (event, userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.id, r.name FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `;
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.id)); // return just the role IDs
      });
    });
  });

  // Update roles for a user
  ipcMain.handle('update-user-roles', async (event, { userId, roleIds }) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`DELETE FROM user_roles WHERE user_id = ?`, [userId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          const stmt = db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`);
          let completed = 0;
          if (roleIds.length === 0) {
            db.run('COMMIT');
            return resolve({ success: true });
          }
          roleIds.forEach(roleId => {
            stmt.run([userId, roleId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              completed++;
              if (completed === roleIds.length) {
                stmt.finalize();
                db.run('COMMIT');
                resolve({ success: true });
              }
            });
          });
        });
      });
    });
  });
};