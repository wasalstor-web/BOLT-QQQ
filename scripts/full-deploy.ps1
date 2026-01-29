# =====================================================
# 🚀 Complete Deployment Script for bolt.diy + Supabase
# Uses Cloudflare API for automation
# =====================================================

$ErrorActionPreference = "Stop"

# Configuration
$CF_TOKEN = "63cMHP8CHlzcEz7GH00L04LSdK4rpMh61qQsfgYh"
$CF_ACCOUNT_ID = "66aa51e4383ffe2736fe8ed4155cd31d"
$DOMAIN = "wasemsaa.cloud"
$VPS_IP = "147.93.120.99"
$VPS_USER = "root"
$PROJECT_PATH = "C:\Users\DealP\bolt.diy"

$headers = @{
    "Authorization" = "Bearer $CF_TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 bolt.diy + Supabase Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Verify Token
Write-Host "`n📋 Step 1: Verifying Cloudflare Token..." -ForegroundColor Yellow
try {
    $verify = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers
    if ($verify.success) {
        Write-Host "✅ Token is valid" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Token verification failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get Zone ID
Write-Host "`n📋 Step 2: Getting Zone ID for $DOMAIN..." -ForegroundColor Yellow
try {
    $zones = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" -Headers $headers
    if ($zones.result.Count -gt 0) {
        $ZONE_ID = $zones.result[0].id
        Write-Host "✅ Zone ID: $ZONE_ID" -ForegroundColor Green
    } else {
        Write-Host "❌ Domain not found in Cloudflare" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to get zone: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Add DNS record for api subdomain (pointing to VPS)
Write-Host "`n📋 Step 3: Adding DNS record for api.$DOMAIN..." -ForegroundColor Yellow
$apiDnsBody = @{
    type = "A"
    name = "api"
    content = $VPS_IP
    ttl = 1
    proxied = $true
} | ConvertTo-Json

try {
    # Check if record exists
    $existingRecords = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=api.$DOMAIN" -Headers $headers
    
    if ($existingRecords.result.Count -gt 0) {
        # Update existing
        $recordId = $existingRecords.result[0].id
        $result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$recordId" -Method Put -Headers $headers -Body $apiDnsBody
        Write-Host "✅ Updated DNS record for api.$DOMAIN -> $VPS_IP" -ForegroundColor Green
    } else {
        # Create new
        $result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body $apiDnsBody
        Write-Host "✅ Created DNS record for api.$DOMAIN -> $VPS_IP" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ DNS record may already exist or failed: $_" -ForegroundColor Yellow
}

# Step 4: Build the project
Write-Host "`n📋 Step 4: Building bolt.diy..." -ForegroundColor Yellow
Set-Location $PROJECT_PATH

# Update .env.local for production
$envContent = @"
# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://api.wasemsaa.cloud
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_URL=https://api.wasemsaa.cloud
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
"@
$envContent | Set-Content ".env.local" -Encoding UTF8
Write-Host "✅ Updated .env.local" -ForegroundColor Green

# Build
Write-Host "🔨 Running build..." -ForegroundColor Yellow
& pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Step 5: Deploy to Cloudflare Pages
Write-Host "`n📋 Step 5: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
$env:CLOUDFLARE_API_TOKEN = $CF_TOKEN
$env:CLOUDFLARE_ACCOUNT_ID = $CF_ACCOUNT_ID

& npx wrangler pages deploy ./build/client --project-name=bolt-diy-wasemsaa --commit-dirty=true
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployed to Cloudflare Pages" -ForegroundColor Green

# Step 6: Setup VPS Tunnel
Write-Host "`n📋 Step 6: Setting up VPS Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "⚠️ This requires manual SSH connection. Run these commands on VPS:" -ForegroundColor Yellow
Write-Host @"

ssh root@$VPS_IP

# Then run:
cloudflared tunnel login
cloudflared tunnel create supabase-api
cloudflared tunnel route dns supabase-api api.wasemsaa.cloud

# Create config
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: supabase-api
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: api.wasemsaa.cloud
    service: http://localhost:8000
  - service: http_status:404
EOF

cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared

"@ -ForegroundColor Cyan

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Complete VPS tunnel setup (commands above)" -ForegroundColor White
Write-Host "2. Add custom domain in Cloudflare Pages:" -ForegroundColor White
Write-Host "   - Go to: https://dash.cloudflare.com/pages" -ForegroundColor Gray
Write-Host "   - Select 'bolt-diy-wasemsaa'" -ForegroundColor Gray
Write-Host "   - Custom domains > Add: app.wasemsaa.cloud" -ForegroundColor Gray
Write-Host "3. Add environment variables in Pages settings" -ForegroundColor White
Write-Host "`nURLs:" -ForegroundColor Yellow
Write-Host "   App: https://app.wasemsaa.cloud" -ForegroundColor Cyan
Write-Host "   API: https://api.wasemsaa.cloud" -ForegroundColor Cyan
