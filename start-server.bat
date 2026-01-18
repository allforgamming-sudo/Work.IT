@echo off
REM Shift Calendar PWA - Server Startup Script
REM This script starts a local web server to run the PWA

echo.
echo ========================================
echo   Shift Calendar PWA Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Python detected - Starting server...
    echo.
    echo Server will start on: http://localhost:8000
    echo.
    echo On iPhone/iPad:
    echo 1. Open Safari
    echo 2. Type: http://192.168.X.X:8000 (replace X with your IP)
    echo.
    echo Press CTRL+C to stop the server
    echo.
    cd /d "%~dp0"
    python -m http.server 8000
    goto :end
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Node.js detected - Starting server...
    echo.
    echo Server will start on: http://localhost:8080
    echo.
    npx http-server
    goto :end
)

REM Check if PHP is installed
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] PHP detected - Starting server...
    echo.
    echo Server will start on: http://localhost:8000
    echo.
    cd /d "%~dp0"
    php -S localhost:8000
    goto :end
)

REM No server found
echo.
echo [✗] No server found! Please install one of:
echo    - Python: https://www.python.org/downloads/
echo    - Node.js: https://nodejs.org/
echo    - PHP: https://www.php.net/downloads
echo.
echo After installation, run this script again.
pause
goto :end

:end
echo.
echo Server stopped.
pause
