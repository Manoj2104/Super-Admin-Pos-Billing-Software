# 🚀 How to Deploy Super Admin Standalone Portal to Render.com (100% Free)

Yes! You can deploy this standalone `super_admin` portal to **Render.com** for **FREE** with automatic HTTPS SSL!

---

## 📋 Steps to Deploy on Render.com:

### Method A: 1-Click GitHub Repository Deployment (Recommended)

1. **Push your code to GitHub:**
   - Create a GitHub Repository for your project.
   - Push your code to GitHub.

2. **Log into Render.com:**
   - Go to [dashboard.render.com](https://dashboard.render.com/)
   - Click **New +** ➔ Select **Web Service**.

3. **Connect GitHub & Select Repository:**
   - Select your GitHub Repository.
   - Set **Root Directory**: `super_admin`
   - Set **Environment**: `Docker`
   - Set **Dockerfile Path**: `./Dockerfile` (or `Dockerfile`)

4. **Click "Create Web Service":**
   - Render will build the Docker container and deploy your Super Admin Portal!
   - You will get a free live URL like: `https://infypos-superadmin.onrender.com`

---

## 🔒 Environment Variables Configured:
Your Supabase Cloud DB credentials are automatically loaded:
- `CENTRAL_SUPABASE_HOST`: `db.xzduxvifiancdgnrrgew.supabase.co`
- `CENTRAL_SUPABASE_PORT`: `5432`
- `CENTRAL_SUPABASE_DB`: `postgres`
- `CENTRAL_SUPABASE_USER`: `postgres`
- `CENTRAL_SUPABASE_PASS`: `Manojnandhini@2104`

---

## 🌐 Live Access
Once deployed on Render:
- **URL**: `https://your-app-name.onrender.com/`
- **Login Credentials**: `admin@infypos.com` / `admin123`
