# 🦁 LIONIX AI TECHNOLOGIES — DIRECTADMIN HOSTING DEPLOYMENT MANUAL

**Platform:** LIONIX AI Studio  
**Official Domain:** `https://lionixai.com` & `https://www.lionixai.com`  
**Tagline:** BUILD ANYTHING. CREATE EVERYTHING.  
**Control Panel:** DirectAdmin  
**Application Architecture:** React 19 SPA (Frontend) + Node.js Express (Backend) + Persistent Database Vault

---

## 📋 Executive Overview & Prerequisites

This package is customized specifically for **DirectAdmin Web Hosting** to run the complete LIONIX AI Technologies system independently without requiring Google Cloud Run or paid cloud services.

### Hosting Requirements:
1. **DirectAdmin Control Panel** with one of the following capabilities:
   - **Method A (Recommended):** CloudLinux **"Setup Node.js App"** (Phusion Passenger).
   - **Method B:** SSH Terminal / PM2 process manager with Apache/LiteSpeed Reverse Proxy.
2. **Node.js Runtime:** Node.js 18.x, 20.x, or 22.x LTS.
3. **Storage & Memory:** Minimum 1 GB RAM, 2 GB disk space.
4. **SSL / HTTPS:** DirectAdmin built-in **Let's Encrypt** SSL generator (free).

---

## 📦 Package Contents

The generated `lionixai_directadmin_deployment.zip` contains:
- `dist/` — Optimized production build of the Vite React SPA frontend, fonts, and lion branding assets.
- `dist-server/` — Standalone compiled Node.js backend bundle (`server.prod.js`).
- `app.js` — Phusion Passenger / DirectAdmin Node.js Selector startup script.
- `package.json` — Production dependencies and startup commands.
- `.htaccess` — Multi-mode Apache/LiteSpeed web server configuration (HTTPS redirect, Passenger directives, Reverse proxy fallback, and security headers).
- `.env.production.example` — Zero-leakage environment variable configuration template.
- `data/lionix_db.json` — Initial persistent database schema for users, roles, staff, and system logs.
- `README_DIRECTADMIN.md` — This operational manual.

---

## 🚀 Step-by-Step DirectAdmin Deployment Guide

### STEP 1: Upload and Extract Files in DirectAdmin

1. Log in to your **DirectAdmin Control Panel**.
2. Navigate to **System Info & Files** → **File Manager**.
3. Go to the domain's document root:
   ```
   /domains/lionixai.com/public_html
   ```
   *(Note: If you prefer keeping source files separate from public web access, you may place the application in `/domains/lionixai.com/app` and point PassengerAppRoot there).*
4. Click **Upload File** and select `lionixai_directadmin_deployment.zip`.
5. Once uploaded, right-click (or click the three dots) on `lionixai_directadmin_deployment.zip` and select **Extract**.
6. Ensure files are extracted directly into the folder (`app.js`, `package.json`, `dist/`, etc. are in the root of the folder).
7. Delete the uploaded `.zip` archive after extraction to save disk space.

---

### STEP 2: Configure "Setup Node.js App" in DirectAdmin

1. In DirectAdmin, go to **Extra Features** (or **Software**) → **Setup Node.js App**.
2. Click **CREATE APPLICATION** (top right).
3. Fill in the application parameters:
   - **Node.js version:** Select `20.x` (or `18.x` / `22.x`).
   - **Application mode:** Select **Production**.
   - **Application root:** `/domains/lionixai.com/public_html` (or your chosen folder).
   - **Application URL:** `lionixai.com`
   - **Application startup file:** `app.js`
4. In the **Environment Variables** section at the bottom, add:
   - Name: `NODE_ENV`, Value: `production`
   - Name: `PORT`, Value: `3000`
   - Name: `APP_URL`, Value: `https://lionixai.com`
   - Name: `GEMINI_API_KEY`, Value: `<Your Google Gemini API Key>`
5. Click **CREATE**.

---

### STEP 3: Install Production Dependencies

1. After the application is created, stay on the **Setup Node.js App** configuration page.
2. Locate the button labeled **Run NPM Install** (or **NPM Install**).
3. Click it. DirectAdmin will run `npm install --omit=dev` using its virtual environment.
4. Wait 30–60 seconds until the status shows "NPM install completed successfully".

*(Alternative via SSH):*
If you have SSH access, copy the virtual environment command shown at the top of the DirectAdmin Node.js App page (e.g. `source /home/USERNAME/nodevenv/.../bin/activate`), navigate to your folder, and run:
```bash
npm install --omit=dev
```

---

### STEP 4: Configure Environment Variables (.env)

1. In DirectAdmin File Manager, locate `.env.production.example`.
2. Rename or copy it to `.env`.
3. Open `.env` and configure:
   ```ini
   PORT=3000
   NODE_ENV=production
   APP_URL=https://lionixai.com
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   GMAIL_AUTHORIZED_EMAIL=lionixaitc@gmail.com
   ```
4. Save the file. Ensure `.env` file permissions are set to `600` or `640` for maximum privacy.

---

### STEP 5: Issue Free SSL Certificate (HTTPS)

1. In DirectAdmin, navigate to **Account Manager** → **SSL Certificates**.
2. Select **Free & automatic certificate from Let's Encrypt**.
3. Check the boxes for:
   - `lionixai.com`
   - `www.lionixai.com`
4. Click **SAVE**. DirectAdmin will request and install the Let's Encrypt TLS certificate automatically within 1–2 minutes.
5. In **Domain Setup** → `lionixai.com`, ensure **Force SSL with https redirect** is checked.

---

### STEP 6: Point DNS Records at Your Registrar

Ensure your domain DNS manager has the following records pointed to your DirectAdmin server's IP address:
| Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `<Your DirectAdmin Server IP>` | 3600 |
| **A** | `www` | `<Your DirectAdmin Server IP>` | 3600 |

*(Or configure `www` as CNAME pointing to `lionixai.com`).*

---

### STEP 7: Restart Application & Verify

1. Go back to **Setup Node.js App** in DirectAdmin.
2. Click **RESTART**.
3. Open your browser and navigate to:
   ```
   https://lionixai.com
   ```
4. You should see the private company portal login page with the official gold-embossed LIONIX emblem.
5. Test the health check endpoint:
   ```
   https://lionixai.com/api/health
   ```
   It will return `{ "status": "ok", "company": "LIONIX AI Technologies", ... }`.

---

### STEP 8: Initial Owner Login & Password Setup

1. On the login page, enter:
   - **Email:** `lionixaitc@gmail.com`
2. If logging in for the first time, click **"Initial Owner Setup (lionixaitc@gmail.com)"**.
3. Set your initial temporary master password (minimum 8 characters).
4. After submitting, log in with `lionixaitc@gmail.com` and your password.
5. Receive your single-use 5-minute OTP from `lionixaitc@gmail.com`.
6. Enter the OTP code.
7. The system will prompt you for the **Mandatory First-Time Permanent Password Change**.
8. Set your permanent master password. You will then enter the **LIONIX AI Studio** company management dashboard with complete master administrative authority!

---

## 🛠️ Troubleshooting & DirectAdmin Logs

- **500 Internal Server Error / Passenger Error:**
  Check `stderr.log` or `passenger.log` inside your application directory via DirectAdmin File Manager.
- **Port Conflict:**
  In Phusion Passenger mode, Passenger assigns its own internal socket; you do not need to worry about port collisions.
- **File Permissions:**
  Directories should be `755`, regular files `644`, and `.env` `600`.
- **Database Persistence:**
  Ensure the `data/` folder has write permissions (`755`) so `data/lionix_db.json` can be updated by the server process.
