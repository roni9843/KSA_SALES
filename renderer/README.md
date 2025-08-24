# Moto POS - Renderer

This directory contains the frontend React application for Moto POS, a desktop point-of-sale application built with Electron.

## About The Project

Moto POS is designed to be a comprehensive solution for managing sales, inventory, customers, and more for small to medium-sized businesses. The user interface is built with React and Vite, ensuring a fast and modern user experience.

## Technologies Used

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Internationalization (i18n):** [i18next](https://www.i18next.com/)
- **Styling:** Plain CSS with some components for UI elements.
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)

## Features

The renderer application implements the following user-facing features:
- Dashboard with key business statistics.
- Invoice creation, listing, and printing.
- Product, customer, and supplier management.
- Purchase and stock management.
- Tax rate configuration.
- User and role-based access control management.
- Due collection and payment history tracking.

## Getting Started

To run the frontend application in a development environment, follow these steps.

### Prerequisites

- Node.js and npm installed.

### Installation & Development

1.  **Install root dependencies:**
    Navigate to the project root (`moto_pos`) and run:
    ```sh
    npm install
    ```

2.  **Install renderer dependencies:**
    From the project root, navigate to the `renderer` directory:
    ```sh
    cd renderer
    npm install
    ```

3.  **Run the application:**
    Go back to the project root directory and run the main development script. This will start both the Electron main process and the React development server with Hot-Module-Replacement (HMR).
    ```sh
    cd ..
    npm run dev
    ```

## Build

To create a production build of the React application, run the following command from the `renderer` directory:

```sh
npm run build
```
This will create a `dist` folder inside the `renderer` directory, which is then loaded by Electron in the production build of the desktop app. To build the full application, run `npm run build` from the root directory.

## Colors:
- Form BG: #2D3748
- Form Input: #575F6D