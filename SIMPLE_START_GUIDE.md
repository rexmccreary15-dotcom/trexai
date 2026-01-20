# Simple Guide: How to Run Your Website

## What is "RUN_WITH_FULL_PATH.bat"?

**Simple explanation:**
- It's a helper file that runs your website
- "Full path" means it uses the complete location of Node.js (`C:\Program Files\nodejs`)
- This works even if Node.js isn't in your PATH yet
- You just double-click it and it does everything for you!

**Think of it like:**
- Instead of typing commands, you just click a button
- The file knows where Node.js is installed
- It automatically installs what you need (first time only)
- Then it starts your website

---

## How to Run Your Website (3 Simple Steps)

### Step 1: Open Your Project Folder

1. Open **File Explorer** (the folder icon on your taskbar)
2. Go to: `C:\Users\Rexan\.cursor\cursor app`
   - Or navigate: This PC → C: → Users → Rexan → .cursor → cursor app

### Step 2: Double-Click the File

Find this file: **`RUN_WITH_FULL_PATH.bat`**

Double-click it!

### Step 3: Wait and Open Browser

1. A black window (PowerShell) will open
2. You'll see text scrolling - that's normal!
3. Wait until you see:
   ```
   ✓ Ready in X seconds
   - Local: http://localhost:3000
   ```

4. **Open your web browser** (Chrome, Edge, Firefox, etc.)
5. **Type in the address bar**: `localhost:3000`
6. **Press Enter**

🎉 **Your website is now running!**

---

## What You'll See

### In the PowerShell Window:
- Text scrolling (installing packages - first time only)
- Then: "Ready" message
- Keep this window open while using your website

### In Your Browser:
- **Home page** showing your chat history (empty at first)
- **"Start New Chat"** button
- Click it to start chatting with AI!

---

## First Time vs. Later Times

### First Time:
- Takes 1-3 minutes (installing packages)
- You'll see lots of text scrolling
- Be patient - it's downloading everything needed

### Later Times:
- Takes 10-20 seconds
- Much faster!
- Just starts the website

---

## How to Stop the Website

When you're done:
1. Go back to the black PowerShell window
2. Press **`Ctrl + C`** (hold Ctrl, press C)
3. The website stops
4. You can close the window

---

## Troubleshooting

### "File not found" or "Can't find the file"
- Make sure you're in the right folder: `c:\Users\Rexan\.cursor\cursor app`
- Look for `RUN_WITH_FULL_PATH.bat` file

### Browser shows "Can't connect" or "Page not found"
- Make sure the PowerShell window is still open
- Make sure you see "Ready" message in the window
- Try waiting a bit longer (first time takes a while)

### Lots of errors in the window
- Make sure Node.js is installed
- Try closing and opening the file again
- Check that you're in the right folder

---

## Quick Summary

1. **Go to**: `c:\Users\Rexan\.cursor\cursor app` folder
2. **Double-click**: `RUN_WITH_FULL_PATH.bat`
3. **Wait** for "Ready" message
4. **Open browser**: type `localhost:3000`
5. **Start chatting!**

That's it! 🚀
