# Script to add staging section to README.md

Write-Host "Adding staging section to README.md..." -ForegroundColor Cyan
Write-Host ""

# Read the staging section content
$stagingContent = Get-Content "README_STAGING_SECTION.md" -Raw

# Read the current README  
$readmeContent = Get-Content "README.md" -Raw

# Check if staging section already exists
if ($readmeContent -match "Development Environments") {
    Write-Host "WARNING: Staging section already exists in README.md" -ForegroundColor Yellow
    Write-Host "Skipping insertion to avoid duplicates." -ForegroundColor Yellow
    exit 0
}

# Find the insertion point
$searchText = "## 📁 Project Structure"

if ($readmeContent -match [regex]::Escape($searchText)) {
    # Insert the staging content before "Project Structure"
    $newContent = $readmeContent -replace [regex]::Escape($searchText), "$stagingContent`r`n`r`n$searchText"
    
    # Backup original
    Copy-Item "README.md" "README.md.backup"
    
    # Write the updated content
    $newContent | Out-File "README.md" -Encoding UTF8 -NoNewline
    
    Write-Host "SUCCESS: Staging section added to README.md!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Original README backed up to: README.md.backup" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "ERROR: Could not find insertion point" -ForegroundColor Red
    Write-Host "Please manually copy content from README_STAGING_SECTION.md" -ForegroundColor Yellow
    exit 1
}
