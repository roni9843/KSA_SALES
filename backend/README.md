# Moto POS - Backend API

This directory contains the remote backend API for Moto POS. It is a simple PHP application designed to handle license key validation against a MySQL database.

## Structure

- **/api**: Contains the public-facing API endpoint scripts.
  - **/license/validate.php**: The script that receives a license key and a unique machine ID from the Electron application and validates it.
- **/config**: Contains configuration files.
  - **database.php**: Handles the connection to the MySQL database.

## Deployment

To deploy this backend:

1.  **Create `.env` file:** In the `backend` directory, create a file named `.env`.
2.  **Configure Credentials:** Add your MySQL credentials to the `.env` file in the following format:
    ```ini
    DB_HOST=your_host_name
    DB_NAME=your_database_name
    DB_USER=your_username
    DB_PASS=your_password
    ```
3.  **Create Database Table:** Use the SQL command below to create the `licenses` table in your database.
4.  **Add Validation Logic:** Open `api/license/validate.php` and replace the placeholder logic with a real SQL query to check for the license key in your database.
5.  **Upload:** Upload the entire `backend` directory and the `.env` file to your web host.

## Database Schema

Run the following SQL command in your MySQL database (e.g., via phpMyAdmin) to create the necessary table for licensing.

```sql
CREATE TABLE licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'expired', 'inactive') NOT NULL DEFAULT 'inactive',
    subscription_end_date DATE NOT NULL,
    machine_id VARCHAR(255) NULL UNIQUE,
    customer_name VARCHAR(255) NULL,
    customer_email VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Local Development

To test this backend locally, you will need a local server environment that supports PHP, such as XAMPP, WAMP, MAMP, or by using PHP's built-in web server.

From the `backend` directory, you can run:

```sh
php -S localhost:8000
```

Your validation endpoint would then be available at `http://localhost:8000/api/license/validate.php`.
