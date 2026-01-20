# GitHub Setup Instructions

## Step 1: Create GitHub Repository (You already did this! ✅)

## Step 2: Push Your Code to GitHub

### Option A: Using the Batch File (Easiest)

1. **Get your GitHub repository URL:**
   - Go to your GitHub repository page
   - Click the green "Code" button
   - Copy the HTTPS URL (looks like: `https://github.com/YOUR-USERNAME/trexai.git`)

2. **Run the batch file:**
   - Double-click `PUSH_TO_GITHUB.bat` in your project folder
   - It will initialize git and commit your files

3. **Add your GitHub URL:**
   - Open PowerShell or Command Prompt
   - Navigate to your project:
     ```powershell
     cd "c:\Users\Rexan\.cursor\cursor app"
     ```
   - Add your GitHub repository (replace with YOUR actual URL):
     ```powershell
     git remote add origin https://github.com/YOUR-USERNAME/trexai.git
     ```
   - Push your code:
     ```powershell
     git push -u origin main
     ```

### Option B: Manual Steps

1. **Open PowerShell** in your project folder:
   ```powershell
   cd "c:\Users\Rexan\.cursor\cursor app"
   ```

2. **Initialize git** (if not already done):
   ```powershell
   git init
   ```

3. **Add all files:**
   ```powershell
   git add .
   ```

4. **Commit changes:**
   ```powershell
   git commit -m "Add sessionId and chatId for analytics tracking"
   ```

5. **Set main branch:**
   ```powershell
   git branch -M main
   ```

6. **Add GitHub repository** (replace with YOUR URL):
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/trexai.git
   ```

7. **Push to GitHub:**
   ```powershell
   git push -u origin main
   ```

## Step 3: Connect GitHub to Vercel

1. Go to https://vercel.com
2. Go to your project settings
3. Go to "Git" section
4. Click "Connect Git Repository"
5. Select your GitHub repository
6. Vercel will automatically deploy!

## After Setup

Once connected, every time I make code changes:
- You just need to commit and push to GitHub
- Vercel will automatically deploy the new code
- No more manual redeploying needed!

---

**Need your GitHub repository URL?**
- Go to your GitHub repository page
- Click the green "Code" button
- Copy the HTTPS URL
