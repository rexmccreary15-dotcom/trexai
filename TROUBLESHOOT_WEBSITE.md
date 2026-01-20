# Troubleshooting: "This site can't be reached"

## Step-by-Step Fix

### Step 1: Make Sure the Website is Actually Running

1. **Open PowerShell** in your project folder:
   - Go to: `c:\Users\Rexan\.cursor\cursor app`
   - Right-click → "Open in Terminal" or "Open PowerShell here"

2. **Run this command**:
   ```bash
   npm run dev
   ```

3. **Look for this message**:
   ```
   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - Ready in 2.3s
   ```
   
   **If you see this**, the website IS running! ✅
   
   **If you see errors**, read them and share with me.

### Step 2: Check What Port It's Using

Sometimes Next.js uses a different port if 3000 is busy.

**Look for a line that says:**
- `- Local: http://localhost:3000` ← Use this URL
- OR `- Local: http://localhost:3001` ← Use this URL instead
- OR `- Local: http://localhost:XXXX` ← Use whatever number it shows

### Step 3: Common Issues & Fixes

#### Issue: "Port 3000 is already in use"
**Fix**: 
- Close other programs using port 3000
- OR use a different port: `npm run dev -- -p 3001`
- Then go to: http://localhost:3001

#### Issue: "npm is not recognized"
**Fix**: 
- Node.js isn't installed or not in PATH
- Install Node.js from: https://nodejs.org
- Restart your computer after installing

#### Issue: "Cannot find module" or build errors
**Fix**:
```bash
npm install
```
Then try `npm run dev` again

#### Issue: The terminal shows errors
**Fix**: 
- Copy the error message
- Share it with me so I can help fix it

### Step 4: Verify It's Working

1. **Keep the terminal open** (don't close it!)
2. **Open a browser** (Chrome, Edge, Firefox)
3. **Type in address bar**: `http://localhost:3000`
4. **Press Enter**

**Important**: The terminal must stay open! Closing it stops the website.

### Step 5: Still Not Working?

Try these:

1. **Check if something is blocking it**:
   - Try: `http://127.0.0.1:3000` instead of `localhost:3000`

2. **Check Windows Firewall**:
   - Windows might be blocking it
   - Try temporarily disabling firewall to test

3. **Check if Node.js is working**:
   ```bash
   node --version
   npm --version
   ```
   Both should show version numbers

4. **Try a different port**:
   ```bash
   npm run dev -- -p 8080
   ```
   Then go to: http://localhost:8080

---

## Quick Checklist

Before asking for help, check:

- [ ] Did you run `npm run dev`?
- [ ] Is the terminal still open?
- [ ] Do you see "Ready" or "Local: http://localhost:XXXX"?
- [ ] Are you using the exact URL shown in the terminal?
- [ ] Did you try `http://127.0.0.1:3000` instead?
- [ ] Are there any error messages in the terminal?

---

## What to Share With Me

If it's still not working, share:

1. **What you see in the terminal** when you run `npm run dev`
2. **Any error messages**
3. **What URL you're trying** (localhost:3000 or something else)
4. **What browser you're using**

Then I can help you fix it! 🔧
