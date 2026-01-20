# Supabase Authentication Setup - Step by Step Guide

Follow these steps **exactly** in order. Take your time and don't skip any steps.

## STEP 1: Enable Email Authentication in Supabase

1. **Open your browser** and go to: https://supabase.com/dashboard
2. **Sign in** to your Supabase account
3. **Click on your project** (the one you're already using for TREXAI)
4. **In the left sidebar**, click on **"Authentication"** (it has a key icon 🔑)
5. **Click on "Providers"** (under Authentication in the sidebar)
6. **Find "Email"** in the list of providers
7. **Toggle the switch** to turn Email provider **ON** (it should turn blue/green)
8. **Scroll down** on the Email provider settings and find:
   - **"Confirm email"** - Make sure this is **ENABLED** (toggle ON)
   - This is what sends the verification email
9. **Click "Save"** at the bottom of the Email provider section
10. ✅ **Done with Step 1!** Email authentication is now enabled.

---

## STEP 2: Add auth_user_id Column to Database

1. **Still in Supabase dashboard**, in the left sidebar click **"SQL Editor"** (it has a </> icon)
2. **Click "New query"** button (top right, green button)
3. **Copy and paste** this entire SQL code:

```sql
-- Add auth_user_id column to users table for Supabase Auth integration
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Add comment
COMMENT ON COLUMN users.auth_user_id IS 'Supabase Auth user ID (from auth.users table)';
```

4. **Click the "Run"** button (or press Ctrl+Enter)
5. You should see a success message like "Success. No rows returned"
6. ✅ **Done with Step 2!** Database is ready for authentication.

---

## STEP 3: Set Up Google OAuth (OPTIONAL - Skip if you don't want Google login)

### Part A: Create Google Cloud Project

1. **Open a new browser tab** and go to: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **At the top of the page**, you'll see a dropdown that says "Select a project" - **click it**
4. **Click "New Project"** button
5. **Project name**: Type `TREXAI Auth` (or any name you want)
6. **Click "Create"** button
7. **Wait 10-20 seconds** for it to create
8. **Click the project dropdown again** and **select your new project** (TREXAI Auth)

### Part B: Configure OAuth Consent Screen

1. **In Google Cloud Console**, in the left sidebar, click **"APIs & Services"**
2. **Click "OAuth consent screen"** (under APIs & Services)
3. **Choose "External"** (unless you have Google Workspace, then choose Internal)
4. **Click "Create"**
5. **Fill in the form**:
   - **App name**: `TREXAI`
   - **User support email**: Your email address
   - **App logo**: (Skip this - optional)
   - **Application home page**: Your website URL (e.g., `https://cursor-app-ruddy.vercel.app`)
   - **Application privacy policy link**: (Skip - optional)
   - **Application terms of service link**: (Skip - optional)
   - **Authorized domains**: Leave empty for now
   - **Developer contact information**: Your email address
6. **Click "Save and Continue"**
7. **On "Scopes" page**: Click "Save and Continue" (don't add anything)
8. **On "Test users" page**: Click "Save and Continue" (don't add anything)
9. **On "Summary" page**: Click "Back to Dashboard" button

### Part C: Create OAuth Credentials

1. **Still in Google Cloud Console**, in the left sidebar, click **"Credentials"** (under APIs & Services)
2. **Click the blue "+ CREATE CREDENTIALS" button** at the top
3. **Click "OAuth client ID"**
4. **Application type**: Select **"Web application"**
5. **Name**: Type `TREXAI Web Client`
6. **Authorized JavaScript origins**: Click "+ ADD URI" and add:
   - Your Supabase project URL: `https://YOUR-PROJECT-ID.supabase.co`
     - To find this: Go back to Supabase dashboard → Settings → API → Look for "Project URL"
   - Also add: `http://localhost:3000` (for testing)
7. **Authorized redirect URIs**: Click "+ ADD URI" and add:
   - `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
     - Replace YOUR-PROJECT-ID with your actual Supabase project ID
8. **Click "Create"** button
9. **IMPORTANT**: A popup will show your **Client ID** and **Client Secret**
   - **Copy the Client ID** (starts with something like `123456789-abc...`)
   - **Copy the Client Secret** (starts with `GOCSPX-...`)
   - **Save these somewhere safe** - you'll need them in the next step!
10. **Click "OK"** to close the popup

### Part D: Add Google OAuth to Supabase

1. **Go back to Supabase dashboard** (the tab with your Supabase project)
2. **Click "Authentication"** → **"Providers"** (same as Step 1)
3. **Find "Google"** in the provider list
4. **Toggle "Enable Google provider"** to **ON**
5. **Paste your Client ID** from Google Cloud into the "Client ID (for OAuth)" field
6. **Paste your Client Secret** from Google Cloud into the "Client Secret (for OAuth)" field
7. **Click "Save"** button
8. ✅ **Done with Step 3!** Google login is now set up.

---

## STEP 4: Test Your Setup

1. **Deploy your code** (if you haven't already):
   ```powershell
   cd "c:\Users\Rexan\.cursor\cursor app"
   git add .
   git commit -m "Add authentication system"
   git push
   ```

2. **Wait for Vercel to deploy** (check Vercel dashboard)

3. **Visit your website**: https://cursor-app-ruddy.vercel.app

4. **You should see**:
   - Home page loads first (not chat page)
   - A welcome modal appears asking you to create an account
   - "Log In" button in top left corner

5. **Try creating an account**:
   - Click "Create Account / Log In" button
   - Enter an email and password
   - Click "Create Account"
   - Check your email for verification link
   - Click the link in your email
   - You should be logged in!

---

## Troubleshooting

**If you get errors:**
- Make sure you completed ALL steps
- Check that Email provider is enabled in Supabase
- Make sure you ran the SQL code in Step 2
- For Google OAuth: Make sure the redirect URI matches exactly

**If verification email doesn't arrive:**
- Check spam folder
- Make sure "Confirm email" is enabled in Supabase Email provider settings
- Wait a few minutes (emails can be delayed)

---

## What's Next?

Once everything is set up:
- Users can create accounts with email/password
- Users can log in with Google (if you set it up)
- Chats are saved to user accounts
- Users can access their chats from any device when logged in
