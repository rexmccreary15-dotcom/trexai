# How to Check if Your API Key is Working

## Step 1: Check if Key is Saved

1. Open Console (F12)
2. Type: `allow pasting` and press Enter (to allow pasting)
3. Paste this and press Enter:
   ```javascript
   JSON.parse(localStorage.getItem("ai-chat-api-keys"))
   ```
4. You should see your keys. Check if `openai` has a value.

## Step 2: Send a Message and Watch Console

1. Keep the Console open (F12)
2. Send a message in the chat
3. Look for these messages in the console:
   - "Sending request with API keys:"
   - "API Request - Model:"
   - "OpenAI API Key check:"

## Step 3: Check for Errors

Look for any red error messages in the console. Common ones:
- "429" = Quota exceeded (your key has no credits)
- "401" = Invalid API key
- "API key required" = Key not being sent

## What to Tell Me

After you send a message, tell me:
1. What does "Sending request with API keys:" show?
2. What does "OpenAI API Key check:" show?
3. Any red error messages?

This will help me figure out what's wrong!
