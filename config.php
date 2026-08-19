<?php
/**
 * INFY-POS Super Admin Standalone Control Center - Configuration & Database Vault
 * Directly connects to Central SuperAdmin Supabase Cloud Database (PostgreSQL / REST)
 */

define('SUPABASE_HOST', 'aws-0-ap-south-1.pooler.supabase.com');
define('SUPABASE_PORT', 6543);
define('SUPABASE_DB',   'postgres');
define('SUPABASE_USER', 'postgres.xzduxvifiancdgnrrgew');
define('SUPABASE_PASS', 'Manojnandhini@2104');
define('SUPABASE_URL',  'https://xzduxvifiancdgnrrgew.supabase.co');
define('SUPABASE_KEY',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZHV4dmlmaWFuY2RnbnJyZ2V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE3ODc3OSwiZXhwIjoyMTAxNzU0Nzc5fQ.7Z1VKcSUN8_486ytN1Y8R0QSKROM44LBaJ_XYmMHeDY');
define('SUPERADMIN_PASS', 'Admin@2026!'); // Master Portal Access Password

/**
 * High-Speed Direct HTTPS REST Engine to Supabase Cloud Database
 */
function supabaseRest(string $endpoint, string $method = 'GET', ?array $data = null): array {
    $url = rtrim(SUPABASE_URL, '/') . '/rest/v1/' . ltrim($endpoint, '/');
    
    $headers = [
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation',
    ];

    $httpOpts = [
        'method'        => strtoupper($method),
        'header'        => implode("\r\n", $headers) . "\r\n",
        'timeout'       => 10,
        'ignore_errors' => true,
    ];

    if (!empty($data) && in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
        $httpOpts['content'] = json_encode($data);
    }

    $context = stream_context_create([
        'http' => $httpOpts,
        'ssl'  => [
            'verify_peer'      => false,
            'verify_peer_name' => false,
        ]
    ]);

    try {
        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            return ['success' => false, 'error' => 'Network error connecting to Supabase Cloud.'];
        }
        $decoded = json_decode($response, true);
        return [
            'success' => true,
            'data'    => $decoded,
        ];
    } catch (\Throwable $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function getCloudPdo(): ?\PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $modes = ['require', 'prefer', 'allow', 'disable'];

    foreach ($modes as $mode) {
        try {
            $dsn = sprintf("pgsql:host=%s;port=%d;dbname=%s;sslmode=%s", SUPABASE_HOST, SUPABASE_PORT, SUPABASE_DB, $mode);
            $conn = new \PDO($dsn, SUPABASE_USER, SUPABASE_PASS, [
                \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_TIMEOUT            => 5,
            ]);
            $pdo = $conn;
            return $pdo;
        } catch (\Throwable $e) {
            // try next mode
        }
    }

    return null;
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    echo json_encode($data);
    exit;
}

