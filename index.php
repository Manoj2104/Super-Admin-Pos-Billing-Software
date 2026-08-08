<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INFY-POS Enterprise Super Admin Control Center</title>
    <link rel="icon" type="image/png" href="favicon.ico">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body, html { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; min-height: 100vh; }
        #root { min-height: 100vh; }
    </style>
    <script>
        // Synchronously declare Standalone Super Admin Mode & Set Initial Route
        window.SUPERADMIN_API_BASE = 'api.php?action=';
        if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/' || window.location.hash === '#/login') {
            window.location.hash = '#/super_admin';
        }
    </script>
</head>
<body>
    <div id="root"></div>

    <script src="assets/js/app.js"></script>
</body>
</html>
