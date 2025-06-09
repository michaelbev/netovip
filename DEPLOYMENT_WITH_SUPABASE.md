# Deployment with Supabase Integration

## Quick Setup (Recommended)

### 1. Deploy with Integration
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. **Before clicking "Deploy", look for "Add Integrations"**
5. Select **Supabase** from the integrations
6. Follow the setup wizard
7. Deploy!

### 2. Alternative: Add Integration Later
1. Go to your Vercel project dashboard
2. Click "Integrations" tab
3. Find and add "Supabase"
4. Configure the integration
5. Redeploy your project

## What Gets Set Up Automatically

- ✅ New Supabase project (or connects existing)
- ✅ Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Database connection
- ✅ Authentication configuration

## After Integration Setup

1. **Run the SQL scripts** in your Supabase dashboard:
   - Go to SQL Editor in Supabase
   - Run scripts/01-create-tables.sql
   - Run scripts/02-row-level-security.sql
   - Run scripts/03-functions-triggers.sql
   - Run scripts/04-seed-data.sql

2. **Configure Authentication** in Supabase:
   - Go to Authentication → Settings
   - Set up your auth providers
   - Configure email templates

3. **Test your application**:
   - Try signing up
   - Test login functionality
   - Verify dashboard loads

## Benefits of Integration

- 🚀 **Faster setup** - No manual environment variable configuration
- 🔄 **Automatic updates** - Environment variables stay in sync
- 🛡️ **Better security** - Managed connection between services
- 📊 **Unified dashboard** - Manage both services from Vercel
- 🔧 **Easy scaling** - Automatic resource management

## Troubleshooting

If you still see environment variable errors:
1. Check that the integration is properly connected
2. Redeploy your project after adding integration
3. Verify environment variables in Vercel project settings
4. Check Supabase project is active and accessible
