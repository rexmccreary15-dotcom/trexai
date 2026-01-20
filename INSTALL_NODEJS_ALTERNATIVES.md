# Alternative Ways to Install Node.js

## Problem: Node.js website requires sign-in

If the official Node.js website is asking you to sign in, here are alternative methods:

---

## Method 1: Direct Download Link (No Sign-In Required)

### Latest LTS Version (v20.x.x)
Copy and paste this link directly into your browser:

**Windows 64-bit (Most Common):**
```
https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
```

**Windows 32-bit (Older computers):**
```
https://nodejs.org/dist/v20.11.0/node-v20.11.0-x86.msi
```

**How to use:**
1. Copy one of the links above
2. Paste it into your browser address bar
3. Press Enter
4. The download should start automatically
5. Run the downloaded `.msi` file
6. Install and restart your computer

---

## Method 2: Using Windows Package Manager (Winget)

If you have Windows 10/11, you might have `winget` pre-installed:

1. **Open PowerShell as Administrator**:
   - Press `Windows Key + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command**:
```powershell
winget install OpenJS.NodeJS.LTS
```

3. **Restart your computer**

---

## Method 3: Using Chocolatey (If Installed)

If you have Chocolatey installed:

1. **Open PowerShell as Administrator**
2. **Run**:
```powershell
choco install nodejs-lts
```

---

## Method 4: Download from GitHub Releases

Node.js releases are also on GitHub:

1. **Go to**: https://github.com/nodejs/node/releases
2. **Find the latest LTS version** (look for "LTS" tag)
3. **Scroll down to "Assets"**
4. **Download**: `node-v20.11.0-x64.msi` (or latest LTS version)
5. **Run the installer**
6. **Restart your computer**

---

## Method 5: Using NVM (Node Version Manager)

If you want to manage multiple Node.js versions:

1. **Download NVM for Windows**: https://github.com/coreybutler/nvm-windows/releases
2. **Download**: `nvm-setup.exe`
3. **Install NVM**
4. **Open PowerShell** and run:
```powershell
nvm install lts
nvm use lts
```

---

## Recommended: Method 1 (Direct Download)

**Easiest option**: Use the direct download link above. It bypasses the website entirely.

**Steps:**
1. Copy: `https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi`
2. Paste in browser
3. Download starts automatically
4. Run the `.msi` file
5. Install (keep defaults)
6. Restart computer

---

## Verify Installation

After restarting, open PowerShell and run:

```powershell
node --version
npm --version
```

You should see version numbers. If you do ✅, you're ready!

---

## Still Having Issues?

If none of these work, let me know and I can:
- Help you find the exact download link for your system
- Guide you through alternative installation methods
- Help troubleshoot any errors
