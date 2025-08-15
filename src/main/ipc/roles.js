const db = require('../database/db');

module.exports = (ipcMain) => {
  // Get all roles
  ipcMain.handle('get-roles', async () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM roles ORDER BY id DESC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  // Add a new role
  ipcMain.handle('add-role', async (event, name) => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO roles (name) VALUES (?)`, [name], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  });

  // Get permissions for a specific role
  ipcMain.handle('get-role-permissions', async (event, roleId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.id, p.name FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `;
      db.all(sql, [roleId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.id)); // return just the permission IDs
      });
    });
  });

  // Update permissions for a role
  ipcMain.handle('update-role-permissions', async (event, { roleId, permissionIds }) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        // Delete old permissions for the role
        db.run(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }

          // Insert new permissions
          const stmt = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);
          let completed = 0;
          if (permissionIds.length === 0) {
            db.run('COMMIT');
            return resolve({ success: true });
          }
          permissionIds.forEach(permissionId => {
            stmt.run([roleId, permissionId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              completed++;
              if (completed === permissionIds.length) {
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