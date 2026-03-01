#!/bin/bash
# ============================================
# Jejak Nasab — Setup Script untuk cPanel
# Standalone build sudah di-extract ke root
# ============================================

set -e

APP_DIR="$HOME/nasab.groovy-media.com"
ENV_FILE="$APP_DIR/.env"

echo "🚀 Memulai setup Jejak Nasab..."
echo "========================================"

# 1. Cek & buat .env jika belum ada
echo ""
echo "📄 [1/3] Mengecek file .env..."
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

# 2. Buat folder uploads
echo ""
echo "📁 [2/3] Menyiapkan folder uploads..."
mkdir -p "$APP_DIR/public/uploads"
echo "✅ Folder uploads siap."

# 3. Info
echo ""
echo "📌 [3/3] Info..."
echo "========================================"
echo ""
echo "✅ Setup selesai!"
echo ""
echo "🔧 Pastikan di Setup Node.js App cPanel:"
echo "   - Application root : nasab.groovy-media.com"
echo "   - Startup file     : server.js"
echo ""
echo "Lalu klik RESTART di Node.js App Setup."
echo ""
echo "🌐 Akses: https://nasab.groovy-media.com"
echo "========================================"
