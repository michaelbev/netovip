# Deployment Guide

## Fixing Bun/Package Manager Issues

If you're experiencing "https:" package resolution errors, try these solutions:

### Option 1: Force npm usage (Recommended)
1. Delete `bun.lockb` if it exists
2. Ensure `vercel.json` specifies npm (already configured)
3. Deploy to Vercel

### Option 2: Clean install locally
\`\`\`bash
# Remove lock files
rm -rf node_modules bun.lockb package-lock.json yarn.lock

# Install with npm
npm install

# Commit the new package-lock.json
git add package-lock.json
git commit -m "Switch to npm for deployment"
\`\`\`

### Option 3: Vercel Project Settings
1. Go to your Vercel project settings
2. Under "Build & Development Settings"
3. Set Install Command to: `npm install`
4. Set Build Command to: `npm run build`

### Environment Variables
Set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting
- If deployment still fails, check Vercel build logs
- Ensure Node.js version is 18+ (set in .nvmrc)
- Verify all environment variables are set correctly
