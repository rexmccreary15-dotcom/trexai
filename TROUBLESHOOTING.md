# Troubleshooting: Batch File Closes Immediately

## The Problem
Batch files are opening and closing instantly. This usually means:
1. There's an error happening immediately
2. Windows security is blocking it
3. The file path has special characters causing issues

## Solutions to Try

### Solution 1: Use PowerShell Script (RECOMMENDED)

I created a PowerShell version that's more reliable:

1. **Find**: "RUN_IN_POWERSHELL" file
2. **Right-click** on it
3. **Select**: "Run with PowerShell"
4. If it asks about execution policy, type `Y` and press Enter

This should work better than batch files!

---

### Solution 2: Run from Command Prompt

1. **Press** `Windows Key + R`
2. **Type**: `cmd` and press Enter
3. **Type** these commands one by one:

```cmd
cd "c:\Users\Rexan\.cursor\cursor app"
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

---

### Solution 3: Check Windows Security

Windows might be blocking the batch file:

1. **Right-click** on the batch file
2. **Click** "Properties"
3. **Check** "Unblock" at the bottom (if it exists)
4. **Click** OK
5. Try running it again

---

### Solution 4: Run as Administrator

1. **Right-click** on the batch file
2. **Click** "Run as Administrator"
3. Click "Yes" if Windows asks

---

### Solution 5: Manual Steps

If nothing works, do it manually:

1. **Open PowerShell** (search for it in Windows)
2. **Copy and paste** these commands:

```powershell
cd "c:\Users\Rexan\.cursor\cursor app"
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

3. **Press Enter** after each command
4. Wait for "Ready" message
5. Open browser to `localhost:3000`

---

## Quick Test

First, test if batch files work at all:

1. **Double-click**: "TEST.bat"
2. If it shows "TEST - If you see this, batch files work!" and stays open ✅
3. If it closes immediately ❌ - Windows might be blocking batch files

---

## What to Tell Me

If nothing works, tell me:
1. What happens when you double-click TEST.bat?
2. What happens when you try the PowerShell script?
3. Any error messages you see (even briefly)?

---

## Best Option

**Try the PowerShell script first** - it's more reliable on Windows 10/11!
