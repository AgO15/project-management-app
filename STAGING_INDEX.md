# 📚 Staging Environment Documentation Index

This directory contains complete documentation for the dual-environment development setup.

## 🎯 Start Here

**New to this setup?** Read the documents in this order:

1. **[STAGING_EXPLAINED.md](./STAGING_EXPLAINED.md)** ⭐ **START HERE**
   - Understand **what** we did
   - Understand **how** it works
   - Understand **why** we did it
   - See real-world examples
   - Learn the technical architecture

2. **[QUICK_START_STAGING.md](./QUICK_START_STAGING.md)** 
   - Quick reference guide
   - 3-step setup
   - Command cheat sheet
   - Workflow diagram

3. **[STAGING_SETUP.md](./STAGING_SETUP.md)**
   - Detailed setup instructions
   - Step-by-step configuration
   - Troubleshooting guide
   - Security best practices

---

## 📖 Documentation Overview

### **STAGING_EXPLAINED.md** - The "Why" Document
**Purpose:** Deep dive into the reasoning and architecture

**Read this when:**
- You're new to the project
- You want to understand the system
- You need to explain it to others
- You're curious about the technical details

**Contains:**
- Problem statement and solution
- Technical architecture
- Database strategies
- Security considerations
- Real-world examples
- Workflow comparisons

---

### **QUICK_START_STAGING.md** - The "Quick Reference"
**Purpose:** Fast lookup for commands and workflows

**Read this when:**
- You need a quick reminder
- You forgot a command
- You want to see the workflow at a glance

**Contains:**
- Visual overview
- 3-step quick start
- Command reference table
- Typical workflow diagram
- Pro tips

---

### **STAGING_SETUP.md** - The "How-To" Guide
**Purpose:** Step-by-step setup and usage instructions

**Read this when:**
- You're setting up for the first time
- You need detailed instructions
- You're troubleshooting an issue
- You want to know all available options

**Contains:**
- Initial setup steps
- Configuration options
- Running servers
- Environment file management
- Troubleshooting section
- Visual indicator code

---

## 🛠️ Helper Scripts

### **setup-staging.ps1**
**Purpose:** Automate initial setup

**Run this:**
```powershell
.\setup-staging.ps1
```

**What it does:**
- Creates `.env.staging` from template
- Creates `.env.production` from `.env.local`
- Guides you through next steps

---

### **switch-env.ps1**
**Purpose:** Switch between environments

**Run this:**
```powershell
# Switch to staging
.\switch-env.ps1 staging

# Switch to production
.\switch-env.ps1 production
```

**What it does:**
- Backs up current environment
- Switches to selected environment
- Shows next steps

---

## 🔄 Workflow Guide

### **.agent/workflows/staging.md**
**Purpose:** Automated workflow for running staging server

**Run this:**
Type `/staging` in the chat

**What it does:**
- Guides you through the staging workflow
- Auto-runs commands (turbo mode)
- Provides troubleshooting tips

---

## 🎓 Learning Path

### **For Beginners:**
1. Read **STAGING_EXPLAINED.md** (understand the "why")
2. Run `.\setup-staging.ps1` (set up your environment)
3. Read **QUICK_START_STAGING.md** (learn the basics)
4. Start testing with `npm run dev:staging`

### **For Quick Setup:**
1. Run `.\setup-staging.ps1`
2. Configure `.env.staging`
3. Run `npm run dev:staging`
4. Refer to **QUICK_START_STAGING.md** as needed

### **For Detailed Understanding:**
1. Read **STAGING_EXPLAINED.md** (full context)
2. Read **STAGING_SETUP.md** (detailed instructions)
3. Experiment with both environments
4. Use **QUICK_START_STAGING.md** as reference

---

## 📋 Quick Command Reference

| Command | Port | Purpose |
|---------|------|---------|
| `npm run dev:staging` | 3001 | Test new features |
| `npm run dev:prod` | 3000 | Test production config |
| `npm run dev` | 3000 | Default development |
| `.\setup-staging.ps1` | - | Initial setup |
| `.\switch-env.ps1 staging` | - | Switch to staging |

---

## 🗂️ File Structure

```
Documentation Files:
├── STAGING_INDEX.md          ← You are here
├── STAGING_EXPLAINED.md      ← Start here (the "why")
├── QUICK_START_STAGING.md    ← Quick reference
└── STAGING_SETUP.md          ← Detailed guide

Helper Scripts:
├── setup-staging.ps1         ← Setup automation
└── switch-env.ps1            ← Environment switcher

Configuration Files:
├── .env.example              ← Template (committed)
├── .env.staging.example      ← Staging template (committed)
├── .env.staging              ← Your staging config (not committed)
├── .env.production           ← Your production config (not committed)
└── .env.local                ← Default config (not committed)

Workflow:
└── .agent/workflows/staging.md  ← Automated workflow
```

---

## 🎯 Common Tasks

### **First Time Setup**
1. Read **STAGING_EXPLAINED.md**
2. Run `.\setup-staging.ps1`
3. Configure `.env.staging`
4. Run `npm run dev:staging`

### **Daily Development**
1. Make code changes
2. Run `npm run dev:staging`
3. Test at http://localhost:3001
4. Commit when satisfied

### **Comparing Environments**
1. Terminal 1: `npm run dev:prod`
2. Terminal 2: `npm run dev:staging`
3. Compare at ports 3000 and 3001

### **Troubleshooting**
1. Check **STAGING_SETUP.md** troubleshooting section
2. Verify `.env.staging` exists and is configured
3. Check that ports aren't already in use
4. Restart dev server after env changes

---

## 💡 Pro Tips

1. **Bookmark this index** - Quick access to all docs
2. **Read STAGING_EXPLAINED.md first** - Understand before doing
3. **Keep QUICK_START_STAGING.md handy** - For quick reference
4. **Use the helper scripts** - They save time
5. **Test in staging always** - Make it a habit

---

## 🆘 Need Help?

**If you're confused:**
- Start with **STAGING_EXPLAINED.md** for context
- Check **STAGING_SETUP.md** for detailed steps
- Use **QUICK_START_STAGING.md** for quick answers

**If something isn't working:**
- Check the troubleshooting section in **STAGING_SETUP.md**
- Verify your `.env.staging` configuration
- Make sure you ran `.\setup-staging.ps1`

**If you want to understand more:**
- Read **STAGING_EXPLAINED.md** thoroughly
- Look at the technical architecture section
- Review the real-world examples

---

## 🚀 Ready to Start?

1. **Read** [STAGING_EXPLAINED.md](./STAGING_EXPLAINED.md) to understand the system
2. **Run** `.\setup-staging.ps1` to set up your environment
3. **Test** with `npm run dev:staging`
4. **Refer** to [QUICK_START_STAGING.md](./QUICK_START_STAGING.md) as needed

---

**Happy coding!** 🎉

*Last updated: December 28, 2025*
