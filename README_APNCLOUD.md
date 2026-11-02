# LIONIX AI TECHNOLOGIES — APNCLOUD DEPLOYMENT MANUAL
## Official Domain: https://lionixai.com & https://www.lionixai.com
## Hosting Provider: APNCLOUD (LiteSpeed Enterprise / CloudLinux / DirectAdmin)

### VERIFIED HOSTING CHARACTERISTICS:
- **Server IP:** 194.163.142.88
- **Web Root:** /domains/lionixai.com/public_html
- **Web Server:** LiteSpeed Enterprise (HTTP/2, HTTP/3, Brotli, Gzip)
- **Node.js Selector:** Supported (v18.x, v20.x, v22.x)
- **PHP:** Supported (v8.2 / v8.3)
- **MySQL / MariaDB:** Supported (Port 3306)

---

### INSTRUCTIONS:

#### Step 1: Upload to APNCLOUD File Manager
1. Log in to your **APNCLOUD DirectAdmin Account**.
2. Navigate to **File Manager** -> `domains/lionixai.com/public_html`.
3. Upload `lionixai_apncloud_deployment.zip`.
4. Click **Extract** directly into `public_html`.
5. Notice that `index.html` is located directly at the root of `public_html`.

#### Step 2: Configure Node.js (If running full-stack Express API)
1. In APNCLOUD DirectAdmin, go to **Extra Features** -> **Setup Node.js App**.
2. Click **Create Application**.
3. Set **Node.js Version** to **20.x** (or 18.x).
4. Set **Application Mode** to **Production**.
5. Set **Application Root** to `/domains/lionixai.com/public_html`.
6. Set **Application Startup File** to `app.js`.
7. Click **Create**.
8. Click **Run NPM Install** to install production packages.

#### Step 3: Configure Environment Variables
1. In `public_html`, copy `.env.production.example` to `.env`.
2. Configure your `GEMINI_API_KEY` and official email credentials.

#### Step 4: Issue Free SSL Certificate
1. In APNCLOUD DirectAdmin -> **SSL Certificates**.
2. Select **Free & automatic certificate from Let's Encrypt**.
3. Select both `lionixai.com` and `www.lionixai.com`.
4. Click **Save**.

#### Step 5: Test & Verify
Open **https://lionixai.com** in your browser.
Your LIONIX AI Studio is now fully active on APNCLOUD!
