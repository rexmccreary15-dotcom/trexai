# Authentication Setup Guide

## Step 1: Enable Supabase Auth

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers** in the left sidebar
4. Enable **Email** provider:
   - Toggle "Enable Email provider" to ON
   - Under "Email Auth", enable "Confirm email" (this enables email verification)
   - Set "Secure email change" to ON
5. Click **Save**

## Step 2: Set Up Google OAuth (Optional but Recommended)

### Part A: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Name it something like "TREXAI Auth" or "My Chat App"
5. Click **Create**
6. Wait for it to finish creating, then select it from the dropdown

### Part B: Create OAuth Credentials

1. In Google Cloud Console, go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in:
     - App name: "TREXAI" (or your app name)
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue** through the steps
   - Click **Back to Dashboard** when done
4. Back at Credentials, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Choose **Web application**
6. Name it: "TREXAI Web Client"
7. Under **Authorized JavaScript origins**, click **"+ ADD URI"** and add:
   - `https://YOUR-PROJECT-ID.supabase.co` (your Supabase project URL)
   - `http://localhost:3000` (for local testing)
8. Under **Authorized redirect URIs**, click **"+ ADD URI"** and add:
   - `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
9. Click **Create**
10. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

### Part C: Add Google OAuth to Supabase

1. Go back to Supabase dashboard → **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle "Enable Google provider" to ON
4. Paste your **Client ID** from Google Cloud
5. Paste your **Client Secret** from Google Cloud
6. Click **Save**

## Step 3: Configure Email Templates (Optional)

1. In Supabase dashboard → **Authentication** → **Email Templates**
2. Customize the email verification template if you want
3. The default will work fine

## Step 4: Get Your Supabase Auth Settings

1. In Supabase dashboard → **Settings** → **API**
2. You should already have:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. These are the same keys you're already using - no new keys needed!

## Step 5: Update Vercel Environment Variables

If you set up Google OAuth, you don't need to add anything new to Vercel - Supabase handles it!

## That's It!

Once you complete these steps, let me know and I'll implement the authentication code.

**Quick Checklist:**
- [ ] Enabled Email provider in Supabase
- [ ] Enabled email confirmation in Supabase
- [ ] Created Google Cloud project (optional)
- [ ] Created Google OAuth credentials (optional)
- [ ] Added Google OAuth to Supabase (optional)
