## 🧪 Development Environments

This project supports **dual-environment development** to safely test changes before deploying to production.

### Quick Overview

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

### Available Commands

| Command | Port | Purpose |
|---------|------|---------|
| `npm run dev` | 3000 | Default development server |
| `npm run dev:staging` | 3001 | Test new features safely |
| `npm run dev:prod` | 3000 | Test with production config |
| `npm run build:staging` | - | Build staging version |
| `npm run start:staging` | 3001 | Run built staging app |

### Quick Start

1. **Set up staging environment:**
   ```powershell
   .\setup-staging.ps1
   ```

2. **Configure your staging credentials:**
   - Edit `.env.staging`
   - Add your Supabase URL and anon key
   - (Recommended: Create a separate Supabase project for staging)

3. **Start testing:**
   ```powershell
   npm run dev:staging
   ```
   Access at: http://localhost:3001

### Recommended Workflow

```
1. Make code changes
   ↓
2. Test in staging (port 3001)
   ↓
3. Verify everything works
   ↓
4. Commit & push to GitHub
   ↓
5. Deploy to production
```

### Running Both Environments Simultaneously

Open two terminals:

**Terminal 1 - Production:**
```powershell
npm run dev:prod
```

**Terminal 2 - Staging:**
```powershell
npm run dev:staging
```

Now you can compare:
- Production: http://localhost:3000
- Staging: http://localhost:3001

### Documentation

For detailed information, see:

- **[STAGING_INDEX.md](./STAGING_INDEX.md)** - Documentation navigation hub
- **[STAGING_EXPLAINED.md](./STAGING_EXPLAINED.md)** - Complete explanation (what, how, why)
- **[STAGING_SETUP.md](./STAGING_SETUP.md)** - Detailed setup guide
- **[QUICK_START_STAGING.md](./QUICK_START_STAGING.md)** - Quick reference

### Benefits

✅ **Safety** - Test changes without affecting production  
✅ **Confidence** - Know your changes work before deploying  
✅ **Comparison** - Run both versions side-by-side  
✅ **Separate Data** - Use different databases for testing  
✅ **No Accidents** - Prevent production deployments of untested code  

---
