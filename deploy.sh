#!/bin/bash
# ============================================
# Jejak Nasab — Deploy Script untuk cPanel
# Jalankan di Terminal cPanel:
#   cd ~/nasab.groovy-media.com && bash deploy.sh
# ============================================

set -e

APP_DIR="$HOME/nasab.groovy-media.com"
ENV_FILE="$APP_DIR/.env"

echo "🚀 Memulai deployment Jejak Nasab..."
echo "========================================"

# 1. Pull latest dari GitHub
echo ""
echo "📥 [1/5] Pulling dari GitHub..."
cd "$APP_DIR"
git pull origin master
echo "✅ Pull selesai."

# 2. Cek & buat .env jika belum ada
echo ""
echo "📄 [2/5] Mengecek file .env..."
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

# 3. Buat folder uploads jika belum ada
echo ""
echo "📁 [3/5] Menyiapkan folder uploads..."
mkdir -p "$APP_DIR/.next/standalone/public/uploads"
echo "✅ Folder uploads siap."

# 4. Salin .env ke standalone
echo ""
echo "📋 [4/5] Menyalin .env ke standalone..."
cp "$ENV_FILE" "$APP_DIR/.next/standalone/.env"
echo "✅ .env disalin ke standalone."

# 5. Info startup
echo ""
echo "📌 [5/5] Konfigurasi Node.js App..."
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
