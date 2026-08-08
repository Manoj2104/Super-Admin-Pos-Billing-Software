# INFY-POS Standalone Super Admin Control Center - Deployment Guide 🚀

This folder (`/super_admin/`) is a **100% standalone, self-contained SaaS Super Admin Portal**. It connects directly to the Central Supabase Database (`db.xzduxvifiancdgnrrgew.supabase.co`) over SSL.

You can zip this single `super_admin` folder and deploy it to **ANY PHP Web Server, cPanel, Subdomain, or VPS** independent of the main POS client application!

---

## 📂 Folder Contents

```
super_admin/
├── config.php          # Central Supabase Database Credentials & PDO Vault
├── api.php             # Standalone API Server for SuperAdmin Operations
├── index.php           # Entry Point for SuperAdmin React Interface
├── .htaccess           # Apache Rewrite & CORS Rules
├── assets/
│   ├── js/             # Compiled SuperAdmin React JS Bundle (app.js)
│   └── css/            # Compiled Design System CSS Styles
└── src/                # Full Uncompiled React Source Code Components
```

---

## 🌐 Deployment Options

### Option 1: Deploy to cPanel / Shared Hosting (Subdomain)
1. Zip the `super_admin` folder into `super_admin.zip`.
2. Log into your cPanel File Manager and upload `super_admin.zip` to `public_html/super_admin` (or a subdomain like `admin.yourdomain.com`).
3. Extract `super_admin.zip`.
4. Open your browser and navigate to: `https://admin.yourdomain.com/` or `https://yourdomain.com/super_admin/`.
5. Login using your SuperAdmin Credentials:
   - **Email / Password**: `admin@infypos.com` / `admin123`

### Option 2: Deploy to Nginx / VPS Server
Add the following block to your Nginx site configuration:
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/pos/super_admin;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

---

## 🔒 Security Directives
- Database credentials to Central Supabase DB are securely stored inside `config.php`.
- SSL encrypted connection (`sslmode=require`) is enforced on all database queries.
- High-Speed 0ms caching is enabled for instant dashboard performance.
