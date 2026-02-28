#!/bin/bash
# ============================================
# Jejak Nasab — Deploy Script untuk cPanel
# Jalankan di Terminal cPanel:
#   source /home/diantar2/nodevenv/nasab.groovy-media.com/20/bin/activate
#   cd ~/nasab.groovy-media.com && bash deploy.sh
# ============================================

set -e

APP_DIR="$HOME/nasab.groovy-media.com"
ENV_FILE="$APP_DIR/.env"

echo "🚀 Memulai deployment Jejak Nasab..."
echo "========================================"

# 1. Pull latest dari GitHub
echo ""
echo "📥 [1/7] Pulling dari GitHub..."
cd "$APP_DIR"
git pull origin master
echo "✅ Pull selesai."

# 2. Cek & buat .env jika belum ada
echo ""
echo "📄 [2/7] Mengecek file .env..."
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  File .env belum ada. Membuat template..."
    cat > "$ENV_FILE" << 'ENVEOF'
DATABASE_URL="mysql://diantar2_nasab:1234Qwer?!?@localhost:3306/diantar2_nasab"
NEXTAUTH_URL="https://nasab.groovy-media.com"
NEXTAUTH_SECRET="9663d9a61e61b51053e7d1fe8c034741bc6822b9917013637eb6ca250743b3ab"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"
NODE_ENV="production"
ENVEOF
    echo "✅ File .env dibuat."
else
    echo "✅ File .env sudah ada."
fi

# 3. Install dependencies
echo ""
echo "📦 [3/7] Installing dependencies..."
npm install --production
echo "✅ Dependencies terinstall."

# 4. Generate Prisma Client
echo ""
echo "🔧 [4/7] Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated."

# 5. Build aplikasi
echo ""
echo "🏗️  [5/7] Building aplikasi..."
npm run build
echo "✅ Build selesai."

# 6. Buat folder uploads & salin .env ke standalone
echo ""
echo "📁 [6/7] Menyiapkan folder & file..."
mkdir -p "$APP_DIR/.next/standalone/public/uploads"
cp "$ENV_FILE" "$APP_DIR/.next/standalone/.env"

# Salin static files ke standalone
if [ -d "$APP_DIR/.next/static" ]; then
    cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/"
fi
if [ -d "$APP_DIR/public" ]; then
    cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/"
fi
echo "✅ Folder & file siap."

# 7. Info startup
echo ""
echo "📌 [7/7] Konfigurasi Node.js App..."
echo "========================================"
echo ""
echo "✅ Deployment selesai!"
echo ""
echo "🔧 Pastikan di Setup Node.js App cPanel:"
echo "   - Application root : nasab.groovy-media.com"
echo "   - Startup file     : .next/standalone/server.js"
echo ""
echo "Lalu klik RESTART di Node.js App Setup."
echo ""
echo "🌐 Akses: https://nasab.groovy-media.com"
echo "========================================"
