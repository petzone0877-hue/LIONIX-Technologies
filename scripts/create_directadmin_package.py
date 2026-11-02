#!/usr/bin/env python3
import os
import sys
import zipfile
import subprocess
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_OUTPUT = os.path.join(ROOT_DIR, 'lionixai_directadmin_deployment.zip')

print(f"[*] Building LIONIX AI Technologies DirectAdmin Deployment Package...")
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
    "--outfile=dist-server/server.prod.js"
]
es_proc = subprocess.run(esbuild_cmd, cwd=ROOT_DIR, capture_output=True, text=True)
if es_proc.returncode != 0:
    print(f"[!] esbuild failed: {es_proc.stderr}")
    sys.exit(1)
print("[+] Backend bundled successfully.")

# 3. Create production package.json
prod_pkg = {
    "name": "lionix-ai-studio",
    "version": "1.0.0",
    "description": "LIONIX AI Technologies — Autonomous AI Software Factory",
    "main": "app.js",
    "type": "module",
    "scripts": {
        "start": "node app.js",
        "production": "node app.js"
    },
    "dependencies": {
        "express": "^4.21.2",
        "dotenv": "^17.2.3",
        "@google/genai": "^2.4.0"
    },
    "engines": {
        "node": ">=18.0.0"
    }
}
prod_pkg_path = os.path.join(ROOT_DIR, 'package.production.json')
with open(prod_pkg_path, 'w', encoding='utf-8') as f:
    json.dump(prod_pkg, f, indent=2)

# 4. Create ZIP archive
print(f"[*] Creating ZIP archive: {ZIP_OUTPUT}...")
if os.path.exists(ZIP_OUTPUT):
    os.remove(ZIP_OUTPUT)

with zipfile.ZipFile(ZIP_OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add dist/
    dist_dir = os.path.join(ROOT_DIR, 'dist')
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, ROOT_DIR)
            zipf.write(full_path, arcname)

    # Add dist-server/
    server_dir = os.path.join(ROOT_DIR, 'dist-server')
    for root, dirs, files in os.walk(server_dir):
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, ROOT_DIR)
            zipf.write(full_path, arcname)

    # Add data/lionix_db.json
    db_path = os.path.join(ROOT_DIR, 'data', 'lionix_db.json')
    if os.path.exists(db_path):
        zipf.write(db_path, 'data/lionix_db.json')

    # Add root files
    zipf.write(os.path.join(ROOT_DIR, 'app.js'), 'app.js')
    zipf.write(prod_pkg_path, 'package.json')
    zipf.write(os.path.join(ROOT_DIR, '.htaccess'), '.htaccess')
    zipf.write(os.path.join(ROOT_DIR, '.env.production.example'), '.env.production.example')
    zipf.write(os.path.join(ROOT_DIR, 'README_DIRECTADMIN.md'), 'README_DIRECTADMIN.md')

if os.path.exists(prod_pkg_path):
    os.remove(prod_pkg_path)

file_size_mb = os.path.getsize(ZIP_OUTPUT) / (1024 * 1024)
print(f"[✓] Deployment package successfully created: {ZIP_OUTPUT} ({file_size_mb:.2f} MB)")
