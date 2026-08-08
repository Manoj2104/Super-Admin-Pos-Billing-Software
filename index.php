<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INFY-POS Enterprise Super Admin Control Center</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"/>
    <style>
        body, html { margin: 0; padding: 0; font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; min-height: 100vh; }
        #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script>
        // Set Standalone Super Admin Flag for 100% direct rendering without Redux or App.js crashes
        window.SUPERADMIN_STANDALONE = true;
        window.__webpack_public_path__ = 'assets/js/';
        
        // Enforce Standalone Super Admin Route (#/super_admin) so Image 1 Login Page Always Renders
        if (window.location.hash !== '#/super_admin') {
            window.location.hash = '#/super_admin';
        }
        window.addEventListener('hashchange', function() {
            if (window.location.hash !== '#/super_admin' && window.location.hash !== '#/super-admin') {
                window.location.hash = '#/super_admin';
            }
        });
        window.SUPERADMIN_API_BASE = 'api.php?action=';
    </script>
    <script src="assets/js/app.js"></script>
</body>
</html>
