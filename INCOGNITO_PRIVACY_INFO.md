# Incognito Mode Privacy Information

## What Incognito Mode Does

When **Incognito Mode** is enabled:

✅ **NOT saved locally** - Chats are not stored in your browser's `localStorage`  
✅ **NOT saved to database** - Chats are not stored in Supabase database  
✅ **NOT tracked in analytics** - No analytics events are recorded  
✅ **NOT visible in chat history** - Chats disappear when you refresh or close the tab  

## What Still Happens

⚠️ **Messages are sent to AI providers** - This is required to generate responses:
- **OpenAI (ChatGPT)**: May log conversations per their privacy policy
- **Google (Gemini)**: May log conversations per their privacy policy  
- **Anthropic (Claude)**: May log conversations per their privacy policy
- **HuggingFace (MyAI)**: See details below

## HuggingFace (MyAI) Privacy

When using **MyAI (HuggingFace)** in incognito mode:

### What HuggingFace Does:
- ✅ **Does NOT store conversation content** (request body or response text)
- ✅ **Does NOT store user data or tokens**
- ⚠️ **May log metadata** (timestamps, model used, request size) for up to 30 days for debugging

### What We Cannot Control:
- **No API parameter exists** to disable HuggingFace logging
- HuggingFace's Inference API doesn't provide a "no logging" option
- Metadata logging is part of their service infrastructure

### According to HuggingFace Documentation:
> "Logs are kept for debugging purposes for up to 30 days, but no user data or tokens are stored. Hugging Face does not store the request body or response when routing requests through the service."

## Privacy Recommendations

1. **For maximum privacy**: Use your own API keys (OpenAI, Gemini, Claude) instead of MyAI
2. **For free usage**: MyAI is the most private free option (doesn't store content)
3. **For sensitive information**: Consider that all AI providers may log conversations

## Summary

- **Incognito mode prevents local/database storage** ✅
- **HuggingFace doesn't store conversation content** ✅  
- **HuggingFace may log metadata for 30 days** ⚠️
- **We cannot disable HuggingFace logging** ❌ (no API parameter exists)
