# Deploy Your Website to Get a Public URL

## Quick Deploy to Vercel (Free & Easy!)

### Step 1: Sign Up for Vercel (Free)

1. Go to: **https://vercel.com/signup**
2. Click **"Sign up with GitHub"** (easiest way)
3. Authorize Vercel to access your GitHub

### Step 2: Install Vercel CLI

Open PowerShell or Command Prompt and run:

```bash
npm install -g vercel
```

### Step 3: Deploy Your Website

1. **Open PowerShell/Command Prompt** in your project folder:
   ```
   cd "c:\Users\Rexan\.cursor\cursor app"
   ```

2. **Run the deploy command**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - It will ask: "Set up and deploy?" → Type `Y` and press Enter
   - "Which scope?" → Select your account
   - "Link to existing project?" → Type `N` (first time)
   - "What's your project's name?" → Press Enter (uses default)
   - "In which directory is your code located?" → Press Enter (uses `./`)
   - It will detect Next.js automatically

4. **Add Environment Variables (Important)**:
   - For the default **Free Mode** (`myai`) to work for visitors, set:
     - `HUGGINGFACE_API_KEY`
   - Optional premium providers:
     - `OPENAI_API_KEY` (OpenAI option)
     - `GOOGLE_GEMINI_API_KEY` (Gemini option)
     - `ANTHROPIC_API_KEY` (Claude option)
   - You can add these in the Vercel dashboard (Project → Settings → Environment Variables),
     or via CLI:
     ```bash
     vercel env add HUGGINGFACE_API_KEY
     ```

5. **Wait for deployment** (takes 1-2 minutes)

6. **Get your URL!** 
   - It will show: `✅ Production: https://your-website-name.vercel.app`
   - **That's your public URL!** 🎉

### Step 4: Access Your Website

- Copy the URL (like `https://your-website-name.vercel.app`)
- Paste it in **any browser** on **any device**
- Your website will be there!

---

## Alternative: Deploy via GitHub (Even Easier!)

### Option A: Push to GitHub, then Deploy

1. **Create a GitHub account** (if you don't have one): https://github.com/signup

2. **Create a new repository**:
   - Go to: https://github.com/new
   - Name it: `ai-chat-website` (or anything)
   - Click "Create repository"

3. **Push your code** (in PowerShell):
   ```bash
   cd "c:\Users\Rexan\.cursor\cursor app"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ai-chat-website.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your GitHub username)

4. **Deploy on Vercel**:
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Deploy"
   - Done! Get your URL in 1-2 minutes

---

## What You'll Get

After deployment, you'll have:

✅ **A public URL** like: `https://your-website.vercel.app`
✅ **Works from any browser** (Chrome, Safari, Edge, etc.)
✅ **Works from any device** (phone, tablet, laptop)
✅ **No installation needed** - just share the link!
✅ **Free hosting** - Vercel is free forever
✅ **Automatic updates** - when you push code, it updates automatically

---

## Quick Commands Summary

**Deploy directly (no GitHub needed):**
```bash
npm install -g vercel
cd "c:\Users\Rexan\.cursor\cursor app"
vercel
```

**Or deploy via GitHub:**
1. Push code to GitHub
2. Go to vercel.com/new
3. Import repository
4. Deploy

---

## Troubleshooting

### "vercel command not found"
- Make sure you ran: `npm install -g vercel`
- Try: `npx vercel` instead

### "Cannot find module" errors
- Run: `npm install` first
- Then try `vercel` again

### Need help?
Share any error messages and I'll help fix them!

---

## After Deployment

Once deployed, you'll get a URL like:
**`https://your-website-name.vercel.app`**

**Share this URL with anyone** - they can access your website from any browser, anywhere in the world! 🌍
