# Moto POS - Desktop Point of Sale Application

Moto POS is a feature-rich, cross-platform desktop point-of-sale (POS) application designed for small to medium-sized businesses. It is built with a modern tech stack, using Electron for the desktop framework and React for the user interface.

## Key Features

- **Invoice Management:** Create, manage, and print professional invoices.
- **Product & Inventory Control:** Track stock levels, manage product details, and categorize items.
- **Customer & Supplier CRM:** Maintain detailed records of customers and suppliers.
- **Purchase Management:** Record and track product purchases to manage inventory effectively.
- **Dashboard & Reporting:** Get a quick overview of your business with a dashboard showing key metrics like sales, purchases, and profit. 
- **Export Reports:** Export sales reports to CSV and PDF formats for further analysis and record-keeping.
- **Product Transaction History:** View a detailed history of a product's sales and purchases.
- **Stock Adjustment:** Manually adjust product stock levels and view a detailed history of all adjustments.
- **Role-Based Access Control (RBAC):** Secure your application with a flexible user, role, and permission system.
- **Due Collection:** Keep track of outstanding payments and manage due collections efficiently.
- **Database Backup & Restore:** Easily export your entire database for backup and import it to restore your application data.
- **Multi-language Support:** The UI supports internationalization (i18n) for easy translation.
- **Subscription Licensing:** Includes a 10-day free trial, license status notifications, and an activation mechanism.

## Tech Stack

- **Desktop Framework:** [Electron](https://www.electronjs.org/)
- **Frontend:** [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Backend Logic:** [Node.js](https://nodejs.org/) (running in the Electron main process)
- **Database:** [SQLite3](https://www.sqlite.org/index.html) for local, file-based data storage.
- **Routing:** [React Router](https://reactrouter.com/)
- **Internationalization:** [i18next](https://www.i18next.com/)

## Project Structure

The project is organized into two main parts. See the README files in each directory for more detailed information.

- **`/src` (Main Process / Backend):**
  - Contains all the backend logic running in Electron's main process.
  - Manages the database (SQLite), handles business logic, and responds to IPC requests from the frontend.
  - Interacts with the operating system and manages the application windows.
  - **[Backend README](./src/README.md)**

- **`/renderer` (Renderer Process / Frontend):**
  - A complete React application that constitutes the User Interface (UI).
  - It runs in a sandboxed browser environment (an Electron `BrowserWindow`).
  - Communicates with the backend via a secure preload script to invoke business logic.
  - **[Frontend README](./renderer/README.md)**

## Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (which includes npm)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd moto_pos
    ```

2.  **Install root dependencies:**
    These are the dependencies for the Electron application itself.
    ```sh
    npm install
    ```

3.  **Install renderer dependencies:**
    Navigate to the `renderer` directory and install the dependencies for the React UI.
    ```sh
    cd renderer
    npm install
    ```

4.  **Return to the root directory:**
    ```sh
    cd ..
    ```

### Running the Application

To start the application in development mode, run the following command from the project root:

```sh
npm run dev
```

This command concurrently starts the React development server (with Hot-Module-Replacement) and the Electron application. The Electron window will automatically load the UI from the dev server.

## Available Scripts

From the root directory:

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Packages the application for production using `electron-builder`. The distributable artifacts will be placed in the `dist/` directory.
- `npm run dev-react`: A sub-script that only starts the frontend Vite dev server.
- `npm run dev-electron`: A sub-script that only starts the Electron main process.

## Building for Production

To create a distributable package of the application, run:

```sh
npm run build
```

This will first build the React application for production and then use `electron-builder` to package it into an executable file for your current operating system (e.g., `.exe`, `.dmg`, `.AppImage`).
