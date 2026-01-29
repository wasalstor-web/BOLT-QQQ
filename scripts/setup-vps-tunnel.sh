#!/bin/bash
# =====================================================
# 🚀 Supabase Cloudflare Tunnel Setup Script
# Domain: api.wasemsaa.cloud
# VPS: 147.93.120.99
# =====================================================

set -e

DOMAIN="api.wasemsaa.cloud"
TUNNEL_NAME="supabase-wasemsaa"
SERVICE_PORT="8000"

echo "=========================================="
echo "🔧 Setting up Cloudflare Tunnel for Supabase"
echo "=========================================="

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    dpkg -i cloudflared.deb
    rm cloudflared.deb
fi

# Check if already logged in
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo ""
    echo "🔐 Please login to Cloudflare..."
    echo "A browser window will open. If not, copy the URL shown."
    echo ""
    cloudflared tunnel login
fi

# Check if tunnel already exists
EXISTING_TUNNEL=$(cloudflared tunnel list | grep "$TUNNEL_NAME" || true)
if [ -n "$EXISTING_TUNNEL" ]; then
    echo "⚠️  Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(echo "$EXISTING_TUNNEL" | awk '{print $1}')
else
    echo "🔨 Creating tunnel: $TUNNEL_NAME"
    cloudflared tunnel create $TUNNEL_NAME
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
fi

echo "📝 Tunnel ID: $TUNNEL_ID"

# Create config directory
mkdir -p ~/.cloudflared

# Create config file
echo "📄 Creating config file..."
cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$SERVICE_PORT
    originRequest:
      noTLSVerify: true
  - service: http_status:404
EOF

echo "✅ Config created at ~/.cloudflared/config.yml"

# Route DNS
echo "🌐 Setting up DNS route..."
cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN 2>/dev/null || echo "DNS route may already exist"

# Stop existing service if running
systemctl stop cloudflared 2>/dev/null || true

# Install as service
echo "🔧 Installing as system service..."
cloudflared service install 2>/dev/null || true

# Enable and start
systemctl enable cloudflared
systemctl restart cloudflared

# Wait and check status
sleep 3
if systemctl is-active --quiet cloudflared; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS! Tunnel is running"
    echo "=========================================="
    echo ""
    echo "🌐 Supabase API: https://$DOMAIN"
    echo "📊 Tunnel Status: Active"
    echo ""
else
    echo "❌ Service failed to start. Checking logs..."
    journalctl -u cloudflared -n 20
fi

# Update Supabase .env
echo ""
echo "🔄 Updating Supabase configuration..."
SUPABASE_ENV="/opt/supabase/docker/.env"
if [ -f "$SUPABASE_ENV" ]; then
    # Backup
    cp $SUPABASE_ENV ${SUPABASE_ENV}.backup
    
    # Update URLs
    sed -i "s|^SITE_URL=.*|SITE_URL=https://app.wasemsaa.cloud|" $SUPABASE_ENV
    sed -i "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://$DOMAIN|" $SUPABASE_ENV
    
    echo "✅ Supabase .env updated"
    echo ""
    echo "🔄 Restarting Supabase containers..."
    cd /opt/supabase/docker
    docker compose down
    docker compose up -d
    
    echo "✅ Supabase restarted"
else
    echo "⚠️  Supabase .env not found at $SUPABASE_ENV"
fi

echo ""
echo "=========================================="
echo "🎉 SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test API: curl https://$DOMAIN/rest/v1/"
echo "2. Deploy bolt.diy to Cloudflare Pages"
echo "3. Add custom domain: app.wasemsaa.cloud"
echo ""
