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

// ── Master RSA-2048 Asymmetric Licensing Keys ───────────────
// PRIVATE KEY: Kept ONLY on the secure license server (never shipped to client)
define('LICENSE_SERVER_PRIVATE_KEY', "-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuYzMxlduwg9Vp
LPjcREiLnaxJqhaY9PeHp8fZQhvqcxMCxNyFbvzqathI3fJNuOKP8dbSuFyZvb/9
8TP9dbEQJxggt06dnpP6rYN6GLnb3s3+AdRUrfdeXTD0Wp1lbMF7fa19gT7UnbxV
BRx1poKHjnIcnCq8W4yKwCtLQltuiwWXwD6JG2uhRGWCkwuiG3uLclp7tevbBUDZ
uDlzdExt1ytt6jEpgvhmu+KmakToM+fU7IdGO0iwKbYpoqWrI1PJ0Vq/2kFyS97i
MKhhYk4WqklBuOHFWo+4mb4CSNG/Z3tMr5z7nwGVbvg03lrn5+ljK5Pav2L6tKhX
LSg09FErAgMBAAECggEAL5S2f6WFYzSdUoyoPCVPa/Sx8Ql9D+/q5/MR9sfwaPhL
7Bn9l1Swol9TsxIHzkgPXTodpLIT5gjdbTLWPiZSEPexwB9zzlLZynB0aqh7ca/p
oZArOI2c7Hzd4hYlUuqpIgIpB5DvrUB6hfIWkU1E2Sq3HPJJQMpz3tnPFkI9Qzws
hKkC5Csf3us8MQi0CzaLxmwVgXquL/q9qXV15C23GEiPRcrQkpaftHV3VpX2ytqf
+UoSeGwW35kLfLdXodBHw95P8DemD3/LVpx5aWoPFHVJWuAd+tzaDBTwIddurV5a
KhIdBQ15CglVjTFheKdYgw/6hh6LnqWeW572NwSbSQKBgQDpUxzufcwPYr1TbtON
R/8XSsbtO5m/6ndmHGc57++IQEHTkhiVwXpZp17zphQaw8WBqmKHoVJqLlTQH7Sr
STeJEdERmCz5CoASSdy2hZ6Gu7CUJsO3Cq8qFYRMd5m1ud9AxQ8eYJZtMvqe3ib1
msSULJeAVcH+yNR1JPrghLX5GQKBgQC/VcnlE3ox1MGJmfzo/UvCASZDXAnv7gy9
RCWtuMRoAjWbr2ETCUUnMlYOtFN7ZebTFk1ULtrrsnVtj9sA9WzIO5NXFaE1xxEv
sevZb6eCzPq6AaHasXdodVXvqKBBf3GShRpvDjeAJBYqs9MU153hJp9zDx8NmyYH
TGBso7nw4wKBgGp/72LEtNIJBdYBbjq8tCkTjr1WSRWalilbqZp+dF1Cx0klFGe2
ynwFs4ePNPoKhiprdVHnRtEEmN3uuu68GsdMBJv9U/nQ2yh94mrFjth871qQXyE7
lTymWZ71sImMb+UGjaIWAFOTw2WkjS/qFvRzbiu7+TKsxJ075e95Y/5xAoGAEoS0
GLbM4dvMq4u63bX+ShWgZW6YC5/Hnd3lo625XLOyCpJr29LO3Z9SkvPDDLNtJssG
yvoJ+Dv6f5MnyCz4zVxuw0P1qWXN9QbMY+wZk2BReAVGbAs3GmYY3iw87nnuPRci
2tLOblmPx6xF5sODpVH+pr007TUx9gzfXERwb68CgYBuKzEayjW1AjuWZI9lrjNz
6WpFo4P3C439nlQN00EFOUP9t6qFetOO8BC21zWQ6EPtZFDW4KV92WslP/oytSw0
TAiAuKXE8igRw0suyo+rSQJIn+bHqHzljyOxa7QImAPi/r3dQRfqFIMRsBVfNk72
UEV6nOm4SprRaA4TUihn5w==
-----END PRIVATE KEY-----");

// PUBLIC KEY: Embedded in client applications for cryptographic signature verification
define('LICENSE_SERVER_PUBLIC_KEY', "-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArmMzMZXbsIPVaSz43ERI
i52sSaoWmPT3h6fH2UIb6nMTAsTchW786mrYSN3yTbjij/HW0rhcmb2//fEz/XWx
ECcYILdOnZ6T+q2Dehi5297N/gHUVK33Xl0w9FqdZWzBe32tfYE+1J28VQUcdaaC
h45yHJwqvFuMisArS0JbbosFl8A+iRtroURlgpMLoht7i3Jae7Xr2wVA2bg5c3RM
bdcrbeoxKYL4ZrvipmpE6DPn1OyHRjtIsCm2KaKlqyNTydFav9pBckve4jCoYWJO
FqpJQbjhxVqPuJm+AkjRv2d7TK+c+58BlW74NN5a5+fpYyuT2r9i+rSoVy0oNPRR
KwIDAQAB
-----END PUBLIC KEY-----");

define('LICENSE_SALT', 'INFYPOS_ENTERPRISE_VAULT_SALT_2026_SECURE');

/**
 * Computes a secure hash for high-entropy activation keys
 */
function hashActivationKey(string $keyCode): string {
    return hash_hmac('sha256', strtoupper(trim($keyCode)), LICENSE_SALT);
}

/**
 * Signs license claims using RSA-2048 (SHA-256) asymmetric cryptography
 */
function signLicensePayload(array $claims): string {
    ksort($claims);
    $payloadJson = json_encode($claims, JSON_UNESCAPED_SLASHES);
    $signature = '';
    openssl_sign($payloadJson, $signature, LICENSE_SERVER_PRIVATE_KEY, OPENSSL_ALGO_SHA256);
    return rtrim(strtr(base64_encode($payloadJson), '+/', '-_'), '=') . '.' . 
           rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
}

/**
 * Verifies a signed license token against the Server Public Key
 */
function verifyLicenseToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    
    $payloadJson = base64_decode(strtr($parts[0], '-_', '+/'));
    $signature   = base64_decode(strtr($parts[1], '-_', '+/'));
    
    $ok = openssl_verify($payloadJson, $signature, LICENSE_SERVER_PUBLIC_KEY, OPENSSL_ALGO_SHA256);
    if ($ok === 1) {
        return json_decode($payloadJson, true);
    }
    return null;
}

/**
 * Rate Limiter to prevent brute force activation guessing
 * Max 5 failed attempts per IP per 10 minutes
 */
function checkRateLimit(string $identifier, int $maxAttempts = 5, int $windowSeconds = 600): bool {
    $cacheFile = sys_get_temp_dir() . '/infy_rate_' . md5($identifier) . '.json';
    $now = time();
    $attempts = [];
    
    if (file_exists($cacheFile)) {
        $data = json_decode(@file_get_contents($cacheFile), true) ?: [];
        $attempts = array_filter($data, fn($ts) => ($now - $ts) < $windowSeconds);
    }
    
    if (count($attempts) >= $maxAttempts) {
        return false; // Rate limit exceeded
    }
    
    return true;
}

function recordFailedAttempt(string $identifier, int $windowSeconds = 600): void {
    $cacheFile = sys_get_temp_dir() . '/infy_rate_' . md5($identifier) . '.json';
    $now = time();
    $attempts = [];
    
    if (file_exists($cacheFile)) {
        $data = json_decode(@file_get_contents($cacheFile), true) ?: [];
        $attempts = array_filter($data, fn($ts) => ($now - $ts) < $windowSeconds);
    }
    $attempts[] = $now;
    @file_put_contents($cacheFile, json_encode($attempts));
}

function clearFailedAttempts(string $identifier): void {
    $cacheFile = sys_get_temp_dir() . '/infy_rate_' . md5($identifier) . '.json';
    if (file_exists($cacheFile)) {
        @unlink($cacheFile);
    }
}

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

