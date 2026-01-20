# Trexai

A ChatGPT-like AI website with multiple AI providers, custom commands, and GitHub integration.

## Features

- Multiple AI providers (OpenAI, Gemini, Claude)
- Chat history with summaries
- Custom command system
- Image uploads
- Keep/Stop feedback system
- GitHub integration for website building

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `env.example` to `.env.local` and add any keys you want to use:
   - `HUGGINGFACE_API_KEY` enables **Free Mode** (`myai`) for all visitors (recommended)
   - `OPENAI_API_KEY` enables the OpenAI option (optional)
   - `GOOGLE_GEMINI_API_KEY` enables the Gemini option (optional)
   - `ANTHROPIC_API_KEY` enables the Claude option (optional)

3. (Optional) Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=sk-...
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `HUGGINGFACE_API_KEY` - Enables **Free Mode** (`myai`) for all visitors (recommended)
- `OPENAI_API_KEY` - Enables the OpenAI model option (optional)
- `GOOGLE_GEMINI_API_KEY` - Enables the Gemini model option (optional)
- `ANTHROPIC_API_KEY` - Enables the Claude model option (optional)
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with `openssl rand -base64 32`)
