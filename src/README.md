# Moto POS - Main Process (Backend)

This directory contains the backend logic for the Moto POS desktop application, running on the Electron main process. It is responsible for handling business logic, database operations, window management, and communication with the frontend (renderer process).

## Technologies Used

- **Framework:** [Electron](https://www.electronjs.org/)
- **Database:** [SQLite3](https://www.sqlite.org/index.html) using the `sqlite3` Node.js package for local data persistence.
- **Authentication:** Passwords are hashed using the `bcrypt` library.

## Architecture

The backend is structured to be modular and maintainable, separating concerns into different files and directories.

- **`main/main.js`**: This is the primary entry point for the Electron application. It handles:
  - Creating and managing the `BrowserWindow`.
  - Loading the renderer application (either from a local dev server or from the build files).
  - Initializing all Inter-Process Communication (IPC) handlers.

- **`main/preload.js`**: This script acts as a secure bridge between the Node.js-powered main process and the sandboxed renderer process. It uses `contextBridge` to expose specific IPC channels to the frontend, preventing the renderer from having direct access to Node.js APIs, which is a critical security practice.

- **`main/database/db.js`**: This file manages everything related to the SQLite database. Its responsibilities include:
  - Establishing the database connection.
  - Defining and creating the entire database schema upon application startup.
  - Seeding the database with initial data, such as creating a default `supperAdmin` user, roles, and permissions.

- **`main/ipc/*.js`**: This directory contains the core business logic of the application, broken down by feature. Each file registers a set of IPC handlers for a specific domain (e.g., `invoice.js`, `product.js`, `auth.js`, `license.js`). This keeps the `main.js` file clean and makes the application logic easy to navigate and manage.

## Database Schema

The application uses a SQLite database (`moto_pos.db`) to store all its data. The schema is defined in `database/db.js` and includes the following key tables:

- `settings`: Stores global application settings, including licensing information like `trial_start_date`, `license_key`, `subscription_end_date`, and `license_status`.
- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`: For handling role-based access control (RBAC).
- `product_category`, `product`: For product and inventory management.
- `customers`, `suppliers`: For managing customer and supplier information.
- `product_purchase`, `product_purchase_item`: For tracking product purchases. The `product_purchase_item` table includes `pre_stock` and `new_stock` columns to record the stock level before and after the transaction.
- `invoice`, `invoice_item`: For creating and managing sales invoices. The `invoice_item` table includes `pre_stock` and `new_stock` columns to record the stock level before and after the transaction.
- `customer_payment_history`: For tracking customer payments and due amounts.
- `tax`: For managing tax rates.
- `stock_adjustment`, `stock_adjustment_item`: For tracking manual stock adjustments. The `stock_adjustment_item` table includes `pre_stock` and `new_stock` columns to maintain a clear audit trail of inventory changes.

## Communication Flow (IPC)

The frontend and backend communicate exclusively through Electron's IPC mechanism:

1.  **Renderer (Frontend):** A user action in the React UI triggers a function call to one of the methods exposed on the `window.electron` object (defined in `preload.js`). For example: `window.electron.ipcRenderer.invoke('get-products')`.
2.  **Preload Script:** The call is securely passed from the renderer's context to the main process via `ipcRenderer`.
3.  **Main Process (Backend):** An `ipcMain.handle('get-products', ...)` listener (located in the relevant file, e.g., `ipc/product.js`) catches the event.
4.  **Business Logic:** The handler function executes the required logic, which often involves querying or modifying the database.
5.  **Response:** The handler returns a result (or an error), which is sent back to the renderer process as a JavaScript Promise that resolves with the data.
