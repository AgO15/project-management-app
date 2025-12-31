# Environment Switcher Script for Windows PowerShell
# This script helps you quickly switch between staging and production environments

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('staging', 'production', 'prod')]
    [string]$Environment
)

# Normalize environment name
if ($Environment -eq 'prod') {
    $Environment = 'production'
}

$sourceFile = ".env.$Environment"
$targetFile = ".env.local"

# Check if source environment file exists
if (-Not (Test-Path $sourceFile)) {
    Write-Host "❌ Error: $sourceFile not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create it first:" -ForegroundColor Yellow
    Write-Host "  Copy-Item .env.$Environment.example $sourceFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then configure your $Environment credentials in the file." -ForegroundColor Yellow
    exit 1
}

# Backup current .env.local if it exists
if (Test-Path $targetFile) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = ".env.local.backup.$timestamp"
    Copy-Item $targetFile $backupFile
    Write-Host "📦 Backed up current environment to: $backupFile" -ForegroundColor Cyan
}

# Copy the selected environment file to .env.local
Copy-Item $sourceFile $targetFile -Force

Write-Host ""
Write-Host "✅ Switched to $Environment environment!" -ForegroundColor Green
Write-Host ""
Write-Host "Environment file: $sourceFile → $targetFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow

if ($Environment -eq 'staging') {
    Write-Host "  npm run dev:staging    # Start staging server on port 3001" -ForegroundColor Cyan
} else {
    Write-Host "  npm run dev:prod       # Start production server on port 3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Tip: You can run both environments simultaneously in different terminals!" -ForegroundColor Magenta
