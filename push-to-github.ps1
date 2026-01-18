# GitHub Push Script for Shift Calendar PWA
# This script automates git add, commit, and push

$gitPath = "C:\Program Files\Git\bin\git.exe"
$projectPath = "d:\codding week 1"

Set-Location $projectPath

Write-Host ""
Write-Host "========================================"
Write-Host "     Shift Calendar - GitHub Uploader"
Write-Host "========================================"
Write-Host ""

# Display current status
Write-Host "[*] Current Status:"
& $gitPath status --short

Write-Host ""
$commitMsg = Read-Host "Enter commit message (default: 'Auto update')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Auto update"
}

Write-Host ""
Write-Host "[*] Adding files..."
& $gitPath add .

Write-Host "[*] Creating commit..."
& $gitPath commit -m $commitMsg

Write-Host "[*] Pushing to GitHub..."
& $gitPath push origin main

Write-Host ""
Write-Host "========================================"
Write-Host "     ✅ Upload Complete!"
Write-Host "========================================"
Write-Host ""
& $gitPath log --oneline -5
Write-Host ""
