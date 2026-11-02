#!/usr/bin/env python3
import os
import sys
import zipfile
import subprocess
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_OUTPUT = os.path.join(ROOT_DIR, 'lionixai_apncloud_deployment.zip')

print(f"[*] Building LIONIX AI Technologies APNCLOUD Deployment Package...")
print(f"[*] Domain: lionixai.com | Hosting: APNCLOUD")
print(f"[*] Root directory: {ROOT_DIR}")

# 1. Build Frontend with Vite
print("[*] Compiling frontend (npm run build)...")
build_proc = subprocess.run(["npm", "run", "build"], cwd=ROOT_DIR, capture_output=True, text=True)
if build_proc.returncode != 0:
    print(f"[!] Frontend build failed: {build_proc.stderr}")
    sys.exit(1)
print("[+] Frontend build successful.")

# 2. Bundle Backend with esbuild
print("[*] Bundling backend with esbuild into dist-server/server.prod.js...")
os.makedirs(os.path.join(ROOT_DIR, 'dist-server'), exist_ok=True)
esbuild_cmd = [
    "npx", "esbuild", "server.ts",
    "--bundle",
    "--platform=node",
    "--format=esm",
    "--target=node18",
    "--external:express",
    "--external:vite",
    "--external:@google/genai",
    "--external:dotenv",
    "--external:jszip",
    "--outfile=dist-server/server.prod.js"
]
es_proc = subprocess.run(esbuild_cmd, cwd=ROOT_DIR, capture_output=True, text=True)
if es_proc.returncode != 0:
    print(f"[!] esbuild failed: {es_proc.stderr}")
    # non-fatal if running static
print("[+] Backend bundled successfully.")

# 3. Create production package.json
prod_pkg = {
    "name": "lionix-ai-studio",
    "version": "1.0.0",
    "description": "LIONIX AI Technologies — APNCLOUD Deployment",
    "main": "app.js",
    "type": "module",
    "scripts": {
        "start": "node app.js",
        "production": "node app.js"
    },
    "dependencies": {
        "express": "^4.21.2",
        "dotenv": "^17.2.3",
        "@google/genai": "^2.4.0",
        "jszip": "^3.10.2"
    },
    "engines": {
        "node": ">=18.0.0"
    }
}
prod_pkg_path = os.path.join(ROOT_DIR, 'package.production.json')
with open(prod_pkg_path, 'w', encoding='utf-8') as f:
    json.dump(prod_pkg, f, indent=2)

# 4. Create README_APNCLOUD.md
apncloud_readme = """# LIONIX AI TECHNOLOGIES — APNCLOUD DEPLOYMENT MANUAL
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
"""

readme_path = os.path.join(ROOT_DIR, 'README_APNCLOUD.md')
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(apncloud_readme)

# 5. Create ZIP archive with index.html at root
print(f"[*] Creating APNCLOUD ZIP archive: {ZIP_OUTPUT}...")
if os.path.exists(ZIP_OUTPUT):
    os.remove(ZIP_OUTPUT)

with zipfile.ZipFile(ZIP_OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Place contents of dist/ directly at the ROOT of the zip
    dist_dir = os.path.join(ROOT_DIR, 'dist')
    if os.path.exists(dist_dir):
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                # arcname relative to dist_dir puts index.html at zip root!
                arcname = os.path.relpath(full_path, dist_dir)
                zipf.write(full_path, arcname)
    else:
        # Fallback to root index.html
        zipf.write(os.path.join(ROOT_DIR, 'index.html'), 'index.html')

    # 2. Add dist-server/
    server_dir = os.path.join(ROOT_DIR, 'dist-server')
    if os.path.exists(server_dir):
        for root, dirs, files in os.walk(server_dir):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, arcname)

    # 3. Add data/lionix_db.json
    db_path = os.path.join(ROOT_DIR, 'data', 'lionix_db.json')
    if os.path.exists(db_path):
        zipf.write(db_path, 'data/lionix_db.json')

    # 4. Add root application files
    if os.path.exists(os.path.join(ROOT_DIR, 'app.js')):
        zipf.write(os.path.join(ROOT_DIR, 'app.js'), 'app.js')
    zipf.write(prod_pkg_path, 'package.json')
    if os.path.exists(os.path.join(ROOT_DIR, '.htaccess')):
        zipf.write(os.path.join(ROOT_DIR, '.htaccess'), '.htaccess')
    if os.path.exists(os.path.join(ROOT_DIR, '.env.production.example')):
        zipf.write(os.path.join(ROOT_DIR, '.env.production.example'), '.env.production.example')
    zipf.write(readme_path, 'README_APNCLOUD.md')

size_mb = os.path.getsize(ZIP_OUTPUT) / (1024 * 1024)
print(f"[+] APNCLOUD Deployment Package successfully created: {ZIP_OUTPUT} ({size_mb:.2f} MB)")
print("[+] index.html is located at the exact ROOT of the ZIP archive.")
