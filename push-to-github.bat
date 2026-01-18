@echo off
REM GitHub Push Script for Shift Calendar PWA
REM This script automates git add, commit, and push

setlocal enabledelayedexpansion

cd "d:\codding week 1"

echo.
echo ========================================
echo     Shift Calendar - GitHub Uploader
echo ========================================
echo.

REM Display current status
echo [*] Current Status:
"C:\Program Files\Git\bin\git.exe" status --short

echo.
REM Ask for commit message
set /p commit_msg="Enter commit message (default: 'Auto update'): "
if "!commit_msg!"=="" set "commit_msg=Auto update"

echo.
echo [*] Adding files...
"C:\Program Files\Git\bin\git.exe" add .

echo [*] Creating commit...
"C:\Program Files\Git\bin\git.exe" commit -m "!commit_msg!"

echo [*] Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo ========================================
echo     ✅ Upload Complete!
echo ========================================
echo.
"C:\Program Files\Git\bin\git.exe" log --oneline -5
echo.
pause
