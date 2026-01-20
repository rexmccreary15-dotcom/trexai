# How to Redeploy Trexai to Vercel

## Quick Steps:

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Find your project (might be named "cursor-app" or similar)
3. Click on it
4. Go to "Settings" → "General"
5. Click "Redeploy" or go to "Deployments" tab and click "Redeploy" on the latest deployment

### Option 2: Via Vercel CLI
Open a **NEW PowerShell window** (outside of Cursor) and run:

```powershell
cd "c:\Users\Rexan\.cursor\cursor app"
vercel --prod
```

### Option 3: Fresh Deployment
If the old deployment is broken:

1. Delete the `.vercel` folder (or rename it to `.vercel.old`)
2. Open PowerShell and run:
   ```powershell
   cd "c:\Users\Rexan\.cursor\cursor app"
   vercel
   ```
3. Follow the prompts to create a new project

## If You Get "Deployment Not Found" Error:

This means the deployment was deleted or expired. Just redeploy using one of the options above.

## After Deployment:

Your site will be available at a URL like:
- `https://trexai.vercel.app` (if you set the project name to "trexai")
- Or `https://your-project-name.vercel.app`

You can change the project name in Vercel dashboard → Settings → General → Project Name
