# How to Install and Run Your AI Chat Website

## Step 1: Install Node.js (Required)

Your website needs Node.js to run. Here's how to install it:

### Option A: Download from Website (Easiest)

1. **Go to**: https://nodejs.org/
2. **Download** the **LTS version** (it will say something like "v20.x.x LTS" - this is the recommended version)
3. **Run the installer** (.msi file that downloads)
4. **Click "Next"** through the installation wizard
   - ✅ Keep all default options checked
   - ✅ Make sure "Add to PATH" is checked (it should be by default)
5. **Click "Install"** and wait for it to finish
6. **IMPORTANT**: Restart your computer after installation

### Option B: Using Windows Package Manager (if you have it)

Open PowerShell as Administrator and run:
```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your computer.

---

## Step 2: Verify Installation

After restarting your computer:

1. **Open PowerShell** (search for "PowerShell" in Windows)
2. **Run these commands** to check if it worked:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

If you see version numbers ✅, you're good to go!
If you see an error ❌, try restarting your computer again.

---

## Step 3: Install Website Dependencies

1. **Open PowerShell**
2. **Navigate to your project folder**:

```powershell
cd "c:\Users\Rexan\.cursor\cursor app"
```

3. **Install all required packages** (this downloads everything needed):

```powershell
npm install
```

⏱️ This takes 1-3 minutes. You'll see lots of text scrolling - that's normal!

---

## Step 4: Run Your Website

After `npm install` finishes:

1. **Start the development server**:

```powershell
npm run dev
```

2. **You should see**:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  ✓ Ready in X seconds
```

3. **Open your web browser** (Chrome, Edge, Firefox, etc.)

4. **Go to**: http://localhost:3000

🎉 **Your website is now running!**

---

## Step 5: Using Your Website

### Home Page
- See all your previous chats
- Click "Start New Chat" to begin

### Chat Page
- **Type messages** in the input box at the bottom
- **Press Enter** to send (Shift+Enter for new line)
- **Click the image icon** to upload photos
- **Click the ⌘ icon** to set up custom commands (like `/a` → `summarize`)
- **Click the 👍 icon** to set Keep/Stop preferences
- **Click the ⚙️ icon** for settings (Incognito mode, temperature, etc.)
- **Click the Home icon** to go back to chat list

### Features to Try
1. **Custom Commands**: Click ⌘, add `/a` → `summarize`, then type `/a` in chat
2. **Incognito Mode**: Settings → Toggle Incognito (chats won't be saved)
3. **Image Upload**: Click image icon, select photos, send
4. **Keep/Stop**: Click 👍, add preferences, see AI adapt

---

## Stopping the Website

When you're done:
- **Press `Ctrl + C`** in the PowerShell window
- This stops the server

---

## Running It Again Later

Every time you want to use your website:

1. Open PowerShell
2. Run:
```powershell
cd "c:\Users\Rexan\.cursor\cursor app"
npm run dev
```
3. Open http://localhost:3000 in your browser

**Note**: You don't need to run `npm install` again - only once!

---

## Troubleshooting

### "node is not recognized"
- ✅ Make sure you restarted your computer after installing Node.js
- ✅ Try opening a NEW PowerShell window
- ✅ Reinstall Node.js from nodejs.org

### "npm install" fails
- ✅ Check your internet connection
- ✅ Make sure you're in the right folder: `c:\Users\Rexan\.cursor\cursor app`
- ✅ Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

### Port 3000 already in use
- ✅ Close any other programs using port 3000
- ✅ Or change port: `npm run dev -- -p 3001` (then use http://localhost:3001)

### Website shows errors
- ✅ Make sure your OpenAI API key is in `.env.local` file
- ✅ Check the PowerShell window for error messages
- ✅ Try stopping (Ctrl+C) and starting again

### Can't see chat history
- ✅ Make sure Incognito mode is OFF in settings
- ✅ Chats are saved in browser's localStorage

---

## Quick Reference

| Task | Command |
|------|---------|
| Check Node.js | `node --version` |
| Check npm | `npm --version` |
| Go to project | `cd "c:\Users\Rexan\.cursor\cursor app"` |
| Install packages | `npm install` |
| Start website | `npm run dev` |
| Stop website | `Ctrl + C` |

---

## Need Help?

If something doesn't work:
1. Check the error message in PowerShell
2. Make sure Node.js is installed (`node --version`)
3. Make sure you're in the right folder
4. Try restarting your computer

Your website is ready to go once Node.js is installed! 🚀
