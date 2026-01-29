# =====================================================
# 🚀 bolt.diy Deployment Script
# Deploys to Cloudflare Pages with custom domain
# =====================================================

param(
    [switch]$SkipBuild,
    [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Users\DealP\bolt.diy"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 bolt.diy Deployment to Cloudflare Pages" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location $ProjectPath

# Step 1: Update environment for production
Write-Host "📝 Step 1: Updating .env.local for production..." -ForegroundColor Yellow

$envContent = @"
# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://api.wasemsaa.cloud
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# Server-side only
SUPABASE_URL=https://api.wasemsaa.cloud
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
"@

$envContent | Set-Content ".env.local" -Encoding UTF8
Write-Host "✅ .env.local updated" -ForegroundColor Green

# Step 2: Build
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "🔨 Step 2: Building project..." -ForegroundColor Yellow
    pnpm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping build" -ForegroundColor Gray
}

# Step 3: Deploy to Cloudflare Pages
if (-not $SkipDeploy) {
    Write-Host ""
    Write-Host "☁️  Step 3: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    
    # Check if wrangler is logged in
    $wranglerWhoami = npx wrangler whoami 2>&1
    if ($wranglerWhoami -match "Not logged in") {
        Write-Host "🔐 Please login to Cloudflare..." -ForegroundColor Yellow
        npx wrangler login
    }
    
    # Deploy
    npx wrangler pages deploy ./build/client --project-name=bolt-diy-app
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Deployment successful" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping deploy" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dash.cloudflare.com/pages" -ForegroundColor White
Write-Host "2. Select 'bolt-diy-app' project" -ForegroundColor White
Write-Host "3. Custom domains > Add: app.wasemsaa.cloud" -ForegroundColor White
Write-Host "4. Add Environment Variables in Settings > Environment Variables:" -ForegroundColor White
Write-Host "   - SUPABASE_URL = https://api.wasemsaa.cloud" -ForegroundColor Gray
Write-Host "   - SUPABASE_ANON_KEY = (the anon key)" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_ROLE = (the service key)" -ForegroundColor Gray
Write-Host ""
