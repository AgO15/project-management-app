# 🎯 Quick Start: Staging vs Production

## 📦 What Was Set Up

Your project now supports **dual environment development**:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PRODUCTION (Port 3000)    STAGING (Port 3001)         │
│  ├── .env.production       ├── .env.staging            │
│  ├── Stable version        ├── Testing version         │
│  └── npm run dev:prod      └── npm run dev:staging     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start (3 Steps)

### 1️⃣ Run the setup script

```powershell
.\setup-staging.ps1
```

### 2️⃣ Configure your staging environment

Edit `.env.staging` and add your Supabase credentials:
- Create a new Supabase project for staging, OR
- Use your existing project (careful - shared database!)

### 3️⃣ Start testing!

```powershell
npm run dev:staging
```

Visit: http://localhost:3001

## 📋 Available Commands

| Command | Port | Purpose |
|---------|------|---------|
| `npm run dev:staging` | 3001 | Test new features safely |
| `npm run dev:prod` | 3000 | Test with production config |
| `npm run dev` | 3000 | Default development |

## 🔄 Typical Workflow

```
1. Make code changes
   ↓
2. Test in staging (port 3001)
   ↓
3. Verify it works
   ↓
4. Test in production (port 3000)
   ↓
5. Commit & push to GitHub
   ↓
6. Deploy to production
```

## 🎨 Run Both Simultaneously

**Terminal 1:**
```powershell
npm run dev:prod
```

**Terminal 2:**
```powershell
npm run dev:staging
```

Now compare side-by-side:
- Production: http://localhost:3000
- Staging: http://localhost:3001

## 📚 Documentation

- **Full Setup Guide**: `STAGING_SETUP.md`
- **Workflow**: Use `/staging` command or see `.agent/workflows/staging.md`
- **Helper Scripts**:
  - `setup-staging.ps1` - Initial setup
  - `switch-env.ps1` - Switch between environments

## 🎯 Benefits

✅ Test changes safely before production  
✅ Run multiple versions simultaneously  
✅ Separate databases for staging/production  
✅ Easy environment switching  
✅ No accidental production deployments  

## 💡 Pro Tips

1. **Use different Supabase projects** for staging and production
2. **Add visual indicators** to know which environment you're in
3. **Test thoroughly in staging** before pushing to production
4. **Keep staging data separate** from production data

## 🆘 Need Help?

- Read `STAGING_SETUP.md` for detailed instructions
- Run `/staging` workflow for guided setup
- Check troubleshooting section in the setup guide

---

**Ready to start?** Run `.\setup-staging.ps1` now! 🚀
