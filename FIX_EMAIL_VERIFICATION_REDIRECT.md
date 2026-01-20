# Fix Email Verification Redirect - Step by Step

This fixes the "localhost refused to connect" error when clicking the email verification link.

## STEP 1: Open Supabase Dashboard

1. **Open your web browser** (Chrome, Edge, Firefox, etc.)
2. **Type in the address bar**: `https://supabase.com/dashboard`
3. **Press Enter**
4. **Sign in** to your Supabase account (use the same email/password you used when you created your Supabase account)

## STEP 2: Select Your Project

1. **Look at the top left** of the Supabase dashboard
2. You should see your project name (it might say something like "My Project" or have a project ID)
3. **Click on your project** to select it (if you only have one project, it's already selected)

## STEP 3: Go to Settings

1. **Look at the left sidebar** (the menu on the left side of the screen)
2. **Scroll down** if needed to find **"Settings"** (it has a gear icon ⚙️)
3. **Click on "Settings"**

## STEP 4: Go to API Settings

1. **After clicking Settings**, you'll see a submenu appear
2. **Click on "API"** (it should be the first or second option under Settings)
3. You should now see a page with API settings

## STEP 5: Find "Site URL" Section

1. **Scroll down** on the API settings page
2. **Look for a section called "Site URL"** (it might be near the top or middle of the page)
3. You should see a text box that says something like `http://localhost:3000` or `http://localhost:3000/`

## STEP 6: Update Site URL

1. **Click inside the "Site URL" text box**
2. **Select all the text** (click and drag, or press Ctrl+A)
3. **Delete it** (press Delete or Backspace)
4. **Type exactly this**: `https://cursor-app-ruddy.vercel.app`
   - Make sure there's NO space at the end
   - Make sure it starts with `https://` (not `http://`)
   - Make sure there's NO `/` at the end

## STEP 7: Find "Redirect URLs" Section

1. **Scroll down a bit more** on the same page
2. **Look for a section called "Redirect URLs"** or "Redirect URL" or "Redirect URIs"
3. You should see a list or text area with URLs

## STEP 8: Add Your Production URL

1. **Look for a button** that says **"+ Add URL"** or **"Add redirect URL"** or **"Add"**
2. **Click that button**
3. **A new text box will appear** - type exactly: `https://cursor-app-ruddy.vercel.app`
4. **Click the "+ Add URL" button again** (or "Add" button)
5. **Another text box will appear** - type exactly: `https://cursor-app-ruddy.vercel.app/*`
   - The `/*` at the end is important - it allows all pages on your site

## STEP 9: Save Changes

1. **Scroll to the bottom** of the API settings page
2. **Look for a "Save" button** (usually blue or green)
3. **Click "Save"**
4. You should see a message like "Settings saved" or "Updated successfully"

## STEP 10: Verify It Worked

1. **Go back to your website**: https://cursor-app-ruddy.vercel.app
2. **Try creating a new account** with a different email
3. **Check your email** for the verification link
4. **Click the verification link** - it should now take you to your website (not localhost)

---

## What You Should See:

**Before fixing:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000` (or empty)

**After fixing:**
- Site URL: `https://cursor-app-ruddy.vercel.app`
- Redirect URLs: 
  - `https://cursor-app-ruddy.vercel.app`
  - `https://cursor-app-ruddy.vercel.app/*`

---

## If You Can't Find Something:

- **Can't find Settings?** Look for a gear icon ⚙️ in the left sidebar
- **Can't find API?** It's under Settings, might be called "API Settings" or just "API"
- **Can't find Site URL?** Scroll down more on the API settings page - it's definitely there
- **No Save button?** Some Supabase versions auto-save - just make sure you see a confirmation message

---

## Still Having Issues?

If you're stuck on any step, tell me:
1. What step number you're on
2. What you see on your screen
3. What you're trying to click

And I'll help you find it!
