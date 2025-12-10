# API Credentials Security Guide

This document outlines how API credentials are protected in this project and steps you need to take to ensure security.

## ✅ What's Already Protected

1. **Environment Variables**: All sensitive credentials are stored in `.env.local` (not committed to git)
2. **Git Ignore**: `.env*` files are excluded from version control
3. **Server-Side Only**: `GOOGLE_API_KEY` is only accessible on the server (no `NEXT_PUBLIC_` prefix)
4. **Type-Safe Access**: Environment variables are validated and accessed through `lib/env.ts`

## 🔐 Environment Variables Used

### Server-Side Only (Secure)
- `GOOGLE_API_KEY` - Google Generative AI API key

### Client-Side Accessible (By Design)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (protected by RLS)
- `NEXT_PUBLIC_SITE_URL` - Your site URL
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Development redirect URL

## 📋 Steps You Need to Complete

### 1. Restrict Your Google API Key

**Important**: Your Google API key should be restricted to prevent unauthorized use.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key in the credentials list
3. Click "Edit" (pencil icon)
4. Under "API restrictions":
   - Select "Restrict key"
   - Enable only: **Generative Language API**
5. Under "Application restrictions" (optional but recommended):
   - For production: Select "HTTP referrers" and add your domain(s)
   - For development: You can leave unrestricted or use IP restrictions
6. Click "Save"

### 2. Verify Supabase Row Level Security (RLS)

Your Supabase `NEXT_PUBLIC_SUPABASE_ANON_KEY` is meant to be public, but you must have proper RLS policies.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" → "Policies"
4. Verify that ALL your tables have RLS enabled
5. Ensure policies are in place for:
   - `projects` table
   - `tasks` table
   - `time_entries` table
   - Any other tables you have

**Example RLS Policy** (for reference):
```sql
-- Allow users to read only their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Set Up Environment Variables for Production

When deploying to production (Vercel, Netlify, etc.):

#### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.example`:
   - `GOOGLE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (your production callback URL)
4. Select the appropriate environment (Production, Preview, Development)
5. Click "Save"

#### For Other Platforms:
- **Netlify**: Settings → Build & Deploy → Environment
- **Railway**: Variables tab in your project
- **Docker**: Use `.env` file or Docker secrets

### 4. Update Production URLs

In your production environment variables, update:
- `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth/callback`

Also update in Supabase:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to "Site URL"
3. Add `https://yourdomain.com/auth/callback` to "Redirect URLs"

### 5. Enable Environment Validation (Optional)

To use the environment validation utility, add this to your root layout or a middleware:

```typescript
// app/layout.tsx or middleware.ts
import { validateEnv } from '@/lib/env';

// Call this at the top level (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
```

### 6. Regular Security Checklist

- [ ] Never commit `.env.local` or any file with real credentials
- [ ] Rotate API keys if they're ever exposed
- [ ] Review Supabase RLS policies regularly
- [ ] Monitor API usage in Google Cloud Console
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use HTTPS in production
- [ ] Enable 2FA on your Google and Supabase accounts

## 🚨 What to Do If Credentials Are Exposed

If you accidentally commit credentials:

1. **Immediately rotate the exposed credentials**:
   - Google API Key: Create a new one in Google Cloud Console
   - Supabase: Regenerate keys in Supabase Dashboard

2. **Remove from Git history**:
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # Or if recent, use:
   git reset --soft HEAD~1
   git reset HEAD .env.local
   git commit -m "Remove sensitive files"
   ```

3. **Update all environments** with new credentials

4. **Force push** (if necessary and safe):
   ```bash
   git push --force
   ```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

## ✅ Quick Verification

Run this checklist to verify your security setup:

```bash
# 1. Verify .env.local is not tracked
git status

# 2. Verify .env.local is in .gitignore
cat .gitignore | grep .env

# 3. Verify environment variables are loaded
npm run dev
# Check console for any missing env var warnings

# 4. Test API endpoints work correctly
# Visit your app and test the chat feature
```

---

**Remember**: Security is an ongoing process. Review this guide periodically and stay updated on best practices!
