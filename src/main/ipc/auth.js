const db = require('../database/db');
const bcrypt = require('bcrypt');
const { session } = require('electron');

module.exports = (ipcMain) => {
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    return new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
          console.error('Login DB Error:', err.message);
          return resolve({ success: false, message: 'A database error occurred.' });
        }
        if (!user) {
          return resolve({ success: false, message: 'Invalid username or password.' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          const userSessionData = {
            id: user.id,
            username: user.username,
          };

          const rolesSql = `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`;
          const permissionsSql = `
            SELECT DISTINCT p.name FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
          `;

          db.all(rolesSql, [user.id], (roleErr, roles) => {
            if (roleErr) {
              return resolve({ success: false, message: 'Error fetching user roles.' });
            }
            userSessionData.roles = roles.map(r => r.name);

            db.all(permissionsSql, [user.id], async (permErr, permissions) => {
              if (permErr) {
                return resolve({ success: false, message: 'Error fetching user permissions.' });
              }
              // If user is supperAdmin, give all permissions regardless
              userSessionData.permissions = userSessionData.roles.includes('supperAdmin') 
                ? ['*'] 
                : permissions.map(p => p.name);

              const cookie = {
                url: 'http://localhost',
                name: 'userSession',
                value: JSON.stringify(userSessionData),
                httpOnly: true,
              };
              await session.defaultSession.cookies.set(cookie);

              resolve({ success: true, user: userSessionData });
            });
          });
        } else {
          resolve({ success: false, message: 'Invalid username or password.' });
        }
      });
    });
  });

  ipcMain.handle('auth:check', async () => {
    const cookies = await session.defaultSession.cookies.get({ name: 'userSession' });
    if (cookies.length > 0) {
      try {
        return JSON.parse(cookies[0].value);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  ipcMain.handle('auth:logout', async () => {
    await session.defaultSession.cookies.remove('http://localhost', 'userSession');
    return { success: true };
  });
};