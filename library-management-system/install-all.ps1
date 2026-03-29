# ============================================================
#  Library Management System — Install All Dependencies
#  IT4020 Assignment 2 | 2026
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

$services = @("api-gateway", "user-service", "book-service", "reservation-service", "borrow-fine-service", "frontend")

Write-Host ""
Write-Host "Installing dependencies for all services..." -ForegroundColor Cyan
Write-Host ""

foreach ($svc in $services) {
    Write-Host "  📦 Installing: $svc" -ForegroundColor Yellow
    $path = Join-Path $root $svc
    Push-Location $path
    npm install
    Pop-Location
    Write-Host "  ✅ Done: $svc" -ForegroundColor Green
    Write-Host ""
}
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  🌱 Initializing Cloud Databases with Seed Data" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
node seed.js

Write-Host ""
Write-Host "🎉 All dependencies installed and data seeded!" -ForegroundColor Green
Write-Host "Run .\start-all.ps1 to launch." -ForegroundColor Cyan
