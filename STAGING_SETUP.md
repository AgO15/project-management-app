# 🚀 Staging Server Setup Guide

This guide explains how to run a local staging server to test changes before deploying to production.

## 📋 Overview

You can now run **two separate instances** of your app simultaneously:
- **Production** (port 3000) - Your live/stable version
- **Staging** (port 3001) - Your testing environment

## 🛠️ Initial Setup

### Step 1: Create Your Staging Environment File

```powershell
# Copy the staging example file
Copy-Item .env.staging.example .env.staging
```

### Step 2: Configure Staging Environment

Open `.env.staging` and configure your staging credentials:

**Option A: Separate Supabase Project (Recommended)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project called "Project Management App - Staging"
3. Copy the URL and anon key to `.env.staging`
4. Run the SQL scripts in `/scripts` folder to set up the database

**Option B: Same Supabase Project**
- Use the same credentials as production
- Be careful - staging and production will share the same database!

### Step 3: Update Your Production Environment

Rename your current `.env.local` to `.env.production`:

```powershell
Rename-Item .env.local .env.production
```

Update `.env.production` to use port 3000:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## 🎯 Usage

### Running Development Servers

**Start Staging Server:**
```powershell
# Development mode (with hot reload)
npm run dev:staging

# Production build mode
npm run build:staging
npm run start:staging
```

**Start Production Server:**
```powershell
# Development mode (with hot reload)
npm run dev:prod

# Production build mode
npm run build:prod
npm run start:prod
```

**Default Development Server:**
```powershell
# Runs on port 3000 by default
npm run dev
```

### Running Both Simultaneously

Open two terminal windows:

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

## 🔄 Workflow: Testing Changes Before Production

### Recommended Workflow:

1. **Make changes** in your code editor
2. **Test in staging** first:
   ```powershell
   npm run dev:staging
   ```
3. **Verify everything works** at http://localhost:3001
4. **If satisfied**, switch to production environment:
   ```powershell
   npm run dev:prod
   ```
5. **Test again** at http://localhost:3000
6. **Commit and push** to GitHub when ready

### Alternative Workflow (Side-by-Side):

1. **Run both servers** in separate terminals
2. **Make code changes** - both will hot-reload
3. **Compare behavior** between staging (3001) and production (3000)
4. **Commit when both work** as expected

## 📁 Environment Files

Your project should have these environment files:

```
.env.example              # Template (committed to git)
.env.staging.example      # Staging template (committed to git)
.env.staging              # Your staging config (NOT committed)
.env.production           # Your production config (NOT committed)
.env.local                # Legacy file (can be deleted)
```

## 🔐 Security Notes

- ✅ `.env.staging` and `.env.production` are in `.gitignore`
- ✅ Never commit actual API keys or credentials
- ✅ Only `.env.example` and `.env.staging.example` are committed
- ⚠️ Use different Supabase projects for staging/production when possible

## 🎨 Visual Indicator (Optional)

To easily identify which environment you're in, you can add a visual indicator:

1. The `NEXT_PUBLIC_APP_ENV` variable is set to `staging` in `.env.staging`
2. You can use this in your UI to show a banner or badge

Example component:
```tsx
{process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
  <div className="bg-yellow-500 text-black text-center py-1">
    🚧 STAGING ENVIRONMENT
  </div>
)}
```

## 🐛 Troubleshooting

**Port already in use:**
```
Error: Port 3001 is already in use
```
Solution: Kill the process using that port or use a different port:
```powershell
npm run dev:staging -- -p 3002
```

**Environment variables not loading:**
- Make sure you've created `.env.staging` from `.env.staging.example`
- Restart your dev server after changing env files
- Check that the file is in the root directory

**Database connection issues:**
- Verify your Supabase URL and keys are correct
- Check that RLS policies are set up in your staging database
- Ensure you've run all SQL migration scripts

## 📝 Quick Reference

| Command | Port | Environment | Use Case |
|---------|------|-------------|----------|
| `npm run dev` | 3000 | Development | Default development |
| `npm run dev:staging` | 3001 | Staging | Test new features |
| `npm run dev:prod` | 3000 | Production | Test production config |
| `npm run build:staging` | - | Staging | Build staging version |
| `npm run start:staging` | 3001 | Staging | Run built staging app |

## 🚀 Next Steps

1. Set up your staging Supabase project
2. Create and configure `.env.staging`
3. Test the staging server: `npm run dev:staging`
4. Establish your preferred workflow
5. Consider setting up automated testing before deployment

---

**Need help?** Check the main README.md or create an issue in the repository.
