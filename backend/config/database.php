<?php
// backend/config/database.php

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Load credentials from .env file located in the parent directory (backend/)
        $envPath = __DIR__ . '/../.env';
        if (file_exists($envPath)) {
            $env = parse_ini_file($envPath);
            $this->host = $env['DB_HOST'];
            $this->db_name = $env['DB_NAME'];
            $this->username = $env['DB_USER'];
            $this->password = $env['DB_PASS'];
        } else {
            die('.env file not found!');
        }
    }

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            // In a real app, you would log this error, not echo it.
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database Connection Error.']);
            exit();
        }

        return $this->conn;
    }
}
?>