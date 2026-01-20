# Installation Guide

## Step 1: Install Node.js

You need Node.js to run this project. Here's how to install it:

### Option A: Download from Official Website (Recommended)
1. Go to: https://nodejs.org/
2. Download the **LTS version** (Long Term Support) - it will say something like "v20.x.x LTS"
3. Run the installer (.msi file)
4. Follow the installation wizard (keep all default options)
5. **Restart your computer** after installation

### Option B: Using Winget (Windows Package Manager)
If you have winget installed, run:
```powershell
winget install OpenJS.NodeJS.LTS
```

### Verify Installation
After restarting, open a new terminal/PowerShell and run:
```bash
node --version
npm --version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

---

## Step 2: Install Project Dependencies

Once Node.js is installed:

1. Open PowerShell or Command Prompt
2. Navigate to the project folder:
   ```bash
   cd "c:\Users\Rexan\.cursor\cursor app"
   ```

3. Install all dependencies:
   ```bash
   npm install
   ```

This will download all the required packages (takes 1-2 minutes).

---

## Step 3: Run the Development Server

After installation completes, start the server:

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

4. Open your browser and go to: **http://localhost:3000**

---

## Troubleshooting

### "node is not recognized"
- Make sure you restarted your computer after installing Node.js
- Try opening a new terminal window
- Check if Node.js is in your PATH: `echo $env:PATH` (PowerShell)

### "npm install" fails
- Make sure you have internet connection
- Try deleting `node_modules` folder and `package-lock.json` (if exists), then run `npm install` again
- Check if you have enough disk space

### Port 3000 already in use
- Close any other applications using port 3000
- Or change the port: `npm run dev -- -p 3001`

---

## GitHub Integration (Coming Soon)

**Important:** GitHub integration is a **feature we'll build into the app**, not something you install separately.

### What it will do:
- When you sign up/login, you'll connect your GitHub account
- The app will use GitHub OAuth (secure login)
- When you ask the AI to build a website, it will:
  - Create a GitHub repository
  - Generate the code files
  - Push them to your GitHub account

### What you'll need (later):
1. A GitHub account (free at github.com)
2. Create a GitHub OAuth App (I'll guide you through this when we build that feature)
3. Add the Client ID and Secret to `.env.local`

### You DON'T need to:
- Install GitHub on your computer
- Install Git (though it's useful to have)
- Connect anything to me (the AI assistant)

The GitHub connection will be **inside the web app** - you'll click a button in the browser to connect your GitHub account, just like "Sign in with Google" on other websites.

---

## Quick Start Checklist

- [ ] Install Node.js from nodejs.org
- [ ] Restart your computer
- [ ] Open new terminal
- [ ] Run `cd "c:\Users\Rexan\.cursor\cursor app"`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000 in browser

---

## Need Help?

If you run into any issues, let me know and I'll help you troubleshoot!
