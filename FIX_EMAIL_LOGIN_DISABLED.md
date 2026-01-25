# Fix: "Email Logins Are Disabled" Error

## Quick Fix (5 minutes)

The error "email logins are disabled" means email authentication is turned OFF in your Supabase dashboard. Here's how to enable it:

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. **Sign in** to your account
3. **Click on your project** (the one you're using for TREXAI)

### Step 2: Enable Email Authentication
1. In the **left sidebar**, click **"Authentication"** (🔑 icon)
2. Click **"Providers"** (under Authentication)
3. Find **"Email"** in the list of providers
4. **Toggle the switch** to turn Email provider **ON** (it should turn blue/green)
5. **Scroll down** and check these settings:
   - **"Confirm email"** - You can leave this ON or OFF:
     - **ON** = Users must verify email before logging in (more secure)
     - **OFF** = Users can log in immediately after signup (easier)
6. **Click "Save"** at the bottom

### Step 3: Test It
1. Go back to your website: **https://cursor-app-ruddy.vercel.app**
2. Try logging in or creating an account
3. It should work now! ✅

---

## If It Still Doesn't Work

### Check These Things:

1. **Make sure you saved the settings** - The toggle should be blue/green (ON)

2. **Wait 1-2 minutes** - Sometimes Supabase takes a moment to update

3. **Clear your browser cache** - Press `Ctrl+Shift+Delete` and clear cache

4. **Check your Supabase project** - Make sure you're editing the correct project

5. **Check environment variables** - Make sure these are set in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Visual Guide

When you're in Supabase Dashboard → Authentication → Providers:

```
┌─────────────────────────────────┐
│ Email Provider                  │
│                                 │
│ [Enable Email provider]  ← Toggle this ON
│                                 │
│ Settings:                       │
│ ☑ Confirm email                 │
│                                 │
│ [Save] ← Click this            │
└─────────────────────────────────┘
```

---

## Still Having Issues?

If email authentication is enabled but you still get errors:
- Check the browser console (F12) for more error details
- Make sure your Supabase URL and keys are correct
- Try creating a new account to test
