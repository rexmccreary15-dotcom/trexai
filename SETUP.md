# Setup Instructions

## Step 1: Install Dependencies

Make sure you have Node.js installed (v18 or higher). Then run:

```bash
npm install
```

## Step 2: Configure API Keys

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Open `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Generate a NextAuth secret (optional for now):
   ```bash
   openssl rand -base64 32
   ```
   Add it to `.env.local` as `NEXTAUTH_SECRET`

## Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Current Features

✅ Basic chat interface
✅ OpenAI integration
✅ AI model selector (UI ready, only OpenAI works for now)
✅ Home page with chat history placeholders

## Coming Soon

- Gemini integration
- Claude integration
- Chat history persistence
- Custom commands system
- Image uploads
- Keep/Stop feedback system
- GitHub integration
