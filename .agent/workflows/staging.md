---
description: Run staging server for testing changes
---

# Running Staging Server

This workflow helps you test changes in a staging environment before deploying to production.

## Prerequisites

1. Ensure you have created your staging environment file:
```powershell
Copy-Item .env.staging.example .env.staging
```

2. Configure your staging credentials in `.env.staging`:
   - Set up a separate Supabase project for staging (recommended)
   - Or use the same Supabase project (be careful with shared data)

## Steps

### 1. Start the staging server

// turbo
```powershell
npm run dev:staging
```

This will start the development server on **port 3001**.

### 2. Access your staging environment

Open your browser and navigate to:
```
http://localhost:3001
```

### 3. Test your changes

- Create test data
- Test new features
- Verify bug fixes
- Check UI/UX changes

### 4. Run both staging and production (optional)

If you want to compare staging vs production side-by-side:

**Terminal 1 - Production:**
```powershell
npm run dev:prod
```

**Terminal 2 - Staging:**
```powershell
npm run dev:staging
```

Now you can access:
- Production: http://localhost:3000
- Staging: http://localhost:3001

### 5. When satisfied, deploy to production

Once you've verified everything works in staging:

```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

## Quick Environment Switch (Alternative Method)

Use the helper script to switch environments:

```powershell
# Switch to staging
.\switch-env.ps1 staging

# Switch to production
.\switch-env.ps1 production
```

## Troubleshooting

**Port already in use:**
```powershell
# Find and kill the process using port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

**Environment variables not loading:**
- Restart your dev server after changing `.env.staging`
- Verify the file exists and has the correct values

## Notes

- Staging uses port **3001**
- Production uses port **3000**
- Both can run simultaneously
- Changes to code will hot-reload in both environments
