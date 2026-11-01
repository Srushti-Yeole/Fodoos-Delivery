@echo off
title Launching Fodoos Food Delivery System...
echo ========================================================
echo               STARTING FODOOS SYSTEM
echo ========================================================
echo.
echo 1. Launching Backend Server on port 4000...
start "Fodoos Backend (Port 4000)" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo 2. Launching Customer Frontend on port 5173...
start "Fodoos Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo 3. Launching Admin Panel on port 5174...
start "Fodoos Admin (Port 5174)" cmd /k "cd /d %~dp0admin1 && npm run dev"

echo.
echo ========================================================
echo Fodoos is running!
echo - Customer Website : http://localhost:5173
echo - Admin Panel      : http://localhost:5174
echo - Backend API      : http://localhost:4000
echo ========================================================
echo Keep the terminal windows open while using the app.
pause
