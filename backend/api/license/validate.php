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

if (!isset($data->licenseKey) || empty($data->licenseKey)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'License key not provided.']);
    exit();
}

$licenseKey = htmlspecialchars(strip_tags($data->licenseKey));

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Create query
$query = 'SELECT 
            id, 
            license_key, 
            status, 
            subscription_end_date
          FROM 
            licenses 
          WHERE 
            license_key = :license_key
          LIMIT 1';

// Prepare statement
$stmt = $db->prepare($query);

// Bind data
$stmt->bindParam(':license_key', $licenseKey);

// Execute query
$stmt->execute();

if ($stmt->rowCount() > 0) {
    // License key found
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    extract($row);

    $endDate = new DateTime($subscription_end_date);
    $now = new DateTime();

    if ($status === 'active' && $endDate > $now) {
        // License is active and not expired
        http_response_code(200); // OK
        echo json_encode([
            'success' => true,
            'data' => [
                'status' => $status,
                'subscriptionEndDate' => $subscription_end_date
            ]
        ]);
    } else {
        // License is expired or not active
        http_response_code(403); // Forbidden
        echo json_encode(['success' => false, 'message' => 'License is expired or inactive.']);
    }

} else {
    // No license key found
    http_response_code(404); // Not Found
    echo json_encode(['success' => false, 'message' => 'License key not found.']);
}

?>