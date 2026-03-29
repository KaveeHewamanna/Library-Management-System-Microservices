# ============================================================
#  Library Management System - Start All Services
#  IT4020 Assignment 2 | 2026
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Library Management System - Starting Up..."    -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ---- User Service (IT22563750) ----
Write-Host "  Starting User Service - Port 3001..." -ForegroundColor Yellow
$p1 = Join-Path $root "user-service"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p1'; Write-Host 'User Service IT22563750 - Port 3001' -ForegroundColor Cyan; npm start"
) -WindowStyle Normal
Start-Sleep -Seconds 1

# ---- Book Service (IT22604958) ----
Write-Host "  Starting Book Service - Port 3002..." -ForegroundColor Yellow
$p2 = Join-Path $root "book-service"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p2'; Write-Host 'Book Service IT22604958 - Port 3002' -ForegroundColor Green; npm start"
) -WindowStyle Normal
Start-Sleep -Seconds 1

# ---- Reservation Service (IT22584090) ----
Write-Host "  Starting Reservation Service - Port 3003..." -ForegroundColor Yellow
$p3 = Join-Path $root "reservation-service"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p3'; Write-Host 'Reservation Service IT22584090 - Port 3003' -ForegroundColor Magenta; npm start"
) -WindowStyle Normal
Start-Sleep -Seconds 1

# ---- Borrow and Fine Service (IT22258694) ----
Write-Host "  Starting Borrow and Fine Service - Port 3004..." -ForegroundColor Yellow
$p4 = Join-Path $root "borrow-fine-service"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p4'; Write-Host 'Borrow and Fine Service IT22258694 - Port 3004' -ForegroundColor DarkYellow; npm start"
) -WindowStyle Normal

Write-Host ""
Write-Host "  Waiting 5 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ---- API Gateway ----
Write-Host "  Starting API Gateway - Port 3000..." -ForegroundColor Green
$p5 = Join-Path $root "api-gateway"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p5'; Write-Host 'API Gateway - Port 3000' -ForegroundColor Green; npm start"
) -WindowStyle Normal

# ---- Frontend UI ----
Write-Host "  Starting Premium Web Frontend..." -ForegroundColor Cyan
$p6 = Join-Path $root "frontend"
Start-Process powershell.exe -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$p6'; Write-Host 'Frontend UI' -ForegroundColor Cyan; npm run dev -- --open"
) -WindowStyle Normal

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  All Services & UI Running!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  Web Dashboard: http://localhost:5173"          -ForegroundColor Green
Write-Host "  API Gateway  : http://localhost:3000"          -ForegroundColor Green
Write-Host "  User Docs    : http://localhost:3001/api-docs" -ForegroundColor Green
Write-Host "  Book Docs    : http://localhost:3002/api-docs" -ForegroundColor Green
Write-Host "  Reserve Docs : http://localhost:3003/api-docs" -ForegroundColor Green
Write-Host "  Borrow Docs  : http://localhost:3004/api-docs" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
