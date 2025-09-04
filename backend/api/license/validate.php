<?php
// backend/api/license/validate.php

// Set headers for CORS and content type
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/database.php';

// Handle preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->licenseKey) || !isset($data->machineId) || empty($data->licenseKey) || empty($data->machineId)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'License key or machine ID not provided.']);
    exit();
}

$licenseKey = htmlspecialchars(strip_tags($data->licenseKey));
$machineId = htmlspecialchars(strip_tags($data->machineId));

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Check if license key exists
$query = 'SELECT id, license_key, status, subscription_end_date, machine_id FROM licenses WHERE license_key = :license_key LIMIT 1';
$stmt = $db->prepare($query);
$stmt->bindParam(':license_key', $licenseKey);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $db_machine_id = $row['machine_id'];
    $db_status = $row['status'];
    $db_subscription_end_date = $row['subscription_end_date'];

    $endDate = new DateTime($db_subscription_end_date);
    $now = new DateTime();

    if ($db_machine_id === null) {
        // First time activation for this key
        if ($db_status === 'active' && $endDate > $now) {
            // Key is valid, lock it to this machine
            $update_query = 'UPDATE licenses SET machine_id = :machine_id WHERE license_key = :license_key';
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':machine_id', $machineId);
            $update_stmt->bindParam(':license_key', $licenseKey);

            if ($update_stmt->execute()) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => ['status' => 'active', 'subscriptionEndDate' => $db_subscription_end_date]]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to lock license to machine.']);
            }
        } else {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'License is expired or inactive.']);
        }
    } else {
        // Key has already been activated
        if ($db_machine_id === $machineId) {
            // It's the same machine, check if still valid
            if ($db_status === 'active' && $endDate > $now) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => ['status' => 'active', 'subscriptionEndDate' => $db_subscription_end_date]]);
            } else {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'License is expired or inactive.']);
            }
        } else {
            // Key is being used on another machine
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'License key is already in use on another computer.']);
        }
    }
} else {
    // No license key found
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'License key not found.']);
}

?>