# Supabase Setup Instructions

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in:
   - **Name**: trexai (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be set up

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, click on the "Settings" icon (gear) in the left sidebar
2. Click "API" in the settings menu
3. You'll see:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key - Copy this (long string starting with `eyJ...`)
   - **service_role** key - Copy this (long string, keep it secret!)

## Step 4: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project (cursor-app or trexai)
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (paste your Project URL)
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (paste your anon public key)
   - Environment: Production, Preview, Development (select all)

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (paste your service_role key)
   - Environment: Production, Preview, Development (select all)
   - ⚠️ **Important**: This key has admin access. Never expose it in client-side code.

5. Click "Save" for each variable

## Step 5: Create Database Tables

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste the SQL from the next section
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 6: Set Up Row Level Security (RLS)

After creating the tables, you'll need to set up RLS policies. The code will handle this, but you can also set them up manually in the Supabase dashboard under "Authentication" → "Policies".

## Step 7: Redeploy Your App

After adding the environment variables:
1. Go to your Vercel project
2. Click "Deployments"
3. Click the three dots on the latest deployment
4. Click "Redeploy"
5. Or push a new commit to trigger a new deployment

Your app should now be connected to Supabase!
