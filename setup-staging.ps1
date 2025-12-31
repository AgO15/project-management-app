# Quick Setup Script for Staging Environment
# Run this script to set up your staging environment for the first time

Write-Host "Setting up Staging Environment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env.staging already exists
if (Test-Path ".env.staging") {
    Write-Host "WARNING: .env.staging already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host "Setup cancelled. Keeping existing .env.staging" -ForegroundColor Red
        exit 0
    }
}

# Step 2: Copy the example file
Write-Host "Creating .env.staging from template..." -ForegroundColor Green
Copy-Item .env.staging.example .env.staging

# Step 3: Check if .env.production exists
if (-Not (Test-Path ".env.production")) {
    if (Test-Path ".env.local") {
        Write-Host "Creating .env.production from .env.local..." -ForegroundColor Green
        Copy-Item .env.local .env.production
        
        # Update port in production file
        $content = Get-Content .env.production
        $content = $content -replace 'localhost:3001', 'localhost:3000'
        $content | Set-Content .env.production
    } else {
        Write-Host "Creating .env.production from template..." -ForegroundColor Green
        Copy-Item .env.example .env.production
        
        # Set production port
        $content = Get-Content .env.production
        $content = $content -replace 'localhost:3000', 'localhost:3000'
        $content | Set-Content .env.production
    }
}

Write-Host ""
Write-Host "SUCCESS: Environment files created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure your staging Supabase credentials:" -ForegroundColor White
Write-Host "   - Open .env.staging in your editor" -ForegroundColor Gray
Write-Host "   - Add your staging Supabase URL and anon key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. (Optional) Create a separate Supabase project for staging:" -ForegroundColor White
Write-Host "   - Go to https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   - Create new project: 'Project Management App - Staging'" -ForegroundColor Gray
Write-Host "   - Run the SQL scripts from /scripts folder" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start your staging server:" -ForegroundColor White
Write-Host "   npm run dev:staging" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Access your staging app at:" -ForegroundColor White
Write-Host "   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more details, see STAGING_SETUP.md" -ForegroundColor Magenta
Write-Host ""
Write-Host "Setup complete! Happy coding!" -ForegroundColor Green
