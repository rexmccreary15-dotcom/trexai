# Troubleshooting API Keys

## If Your API Key Still Doesn't Work

### Step 1: Verify the Key is Saved

1. Open your browser's Developer Console:
   - Press `F12` or `Ctrl+Shift+I`
   - Click the "Console" tab

2. Type this command and press Enter:
   ```javascript
   localStorage.getItem("ai-chat-api-keys")
   ```

3. You should see something like:
   ```json
   {"openai":"sk-...","gemini":"","claude":""}
   ```

4. If you see `null` or the key is missing, it wasn't saved properly.

### Step 2: Check if Key is Being Sent

1. In the Console, look for messages that say:
   - "Sending request with API keys:"
   - "API Request - Model:"

2. These will show if your key is being sent to the server.

### Step 3: Verify Your API Key

1. Make sure your OpenAI API key:
   - Starts with `sk-` or `sk-proj-`
   - Has no extra spaces
   - Is the full key (not cut off)

2. Test your key at: https://platform.openai.com/api-keys
   - Make sure it's active
   - Make sure you have credits/quota

### Step 4: Clear and Re-enter

1. Click the user icon (👤)
2. Clear the OpenAI field (click the trash icon)
3. Re-enter your API key
4. Click "Save Settings"
5. Try chatting again

### Step 5: Check Browser Console for Errors

1. Open Console (F12)
2. Look for red error messages
3. Share any errors you see

## Common Issues

### "API key required" error
- The key wasn't saved properly
- Try saving again in Account Settings

### "429 quota exceeded" error
- Your API key has no credits
- Add billing to your OpenAI account
- Or use a different API key

### Key not showing in console
- The key might not be saved
- Check localStorage manually (Step 1 above)

## Still Not Working?

1. Open Console (F12)
2. Copy any error messages
3. Check what `localStorage.getItem("ai-chat-api-keys")` shows
4. Share that information
