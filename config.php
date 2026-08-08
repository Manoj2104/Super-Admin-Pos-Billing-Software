<?php
/**
 * INFY-POS Super Admin Standalone Control Center - Configuration & Database Vault
 * Directly connects to Central SuperAdmin Supabase Cloud Database (PostgreSQL)
 */

define('SUPABASE_HOST', 'db.xzduxvifiancdgnrrgew.supabase.co');
define('SUPABASE_PORT', 5432);
define('SUPABASE_DB',   'postgres');
define('SUPABASE_USER', 'postgres');
define('SUPABASE_PASS', 'Manojnandhini@2104');
define('SUPABASE_URL',  'https://xzduxvifiancdgnrrgew.supabase.co');
define('SUPERADMIN_PASS', 'Admin@2026!'); // Master Portal Access Password

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
