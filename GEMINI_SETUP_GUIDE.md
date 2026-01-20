# Gemini API Setup Guide

Follow these steps to get your Gemini API key working with MyAI.

## Step 1: Check API Key & Enable Generative Language API

### Link to Google Cloud Console:
**https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com**

### Instructions:
1. **Sign in** to your Google account (the one associated with your API key)
2. **Select your project** (or create a new one if needed)
3. **Click "Enable"** if the API is not already enabled
4. **Wait a few minutes** for the API to activate

### Alternative: Check API Key Status
**https://makersuite.google.com/app/apikey**

1. Go to the link above
2. You'll see your API keys listed
3. Make sure your key `AIzaSyCtBL4cXedUPHgrtkFlGjg7YfOrnxU1bv0` is active
4. If it's not there, create a new one

---

## Step 2: Check Available Models

### Link to List Available Models:
**https://ai.google.dev/models/gemini**

### Instructions:
1. Go to the link above
2. Look for the **"Available Models"** section
3. Note which models are listed (common ones):
   - `gemini-1.5-flash`
   - `gemini-1.5-pro`
   - `gemini-pro`
   - `gemini-1.0-pro`

### Or Test via API (Advanced):
Open your browser console (F12) and run this to see available models:

```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCtBL4cXedUPHgrtkFlGjg7YfOrnxU1bv0')
  .then(r => r.json())
  .then(data => console.log('Available models:', data.models?.map(m => m.name)))
  .catch(e => console.error('Error:', e));
```

**Copy the model names you see** and share them with me.

---

## Step 3: Verify Your Region

Your region might affect model availability. Common regions:
- **United States** (most models available)
- **Europe** (some restrictions)
- **Asia** (some restrictions)
- **Other regions** (may have limitations)

**Just tell me your country/region** and I'll adjust the code accordingly.

---

## Step 4: Test Your API Key (Optional but Recommended)

### Quick Test Script:

Create a file called `test-gemini.js` in your project folder:

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCtBL4cXedUPHgrtkFlGjg7YfOrnxU1bv0");

async function test() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      console.log(`✅ ${modelName} works! Response: ${response.text()}`);
      break; // Stop at first working model
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

test();
```

Then run:
```bash
node test-gemini.js
```

**Share the output** - it will show which model works!

---

## Step 5: Quick Checklist

Before asking for help, make sure:

- [ ] Generative Language API is **enabled** in Google Cloud Console
- [ ] Your API key is **active** and not expired
- [ ] You've checked which **models are available** for your account
- [ ] You know your **region/country**
- [ ] (Optional) You've tested the API key with the script above

---

## What to Share With Me

Once you've done the steps above, share:

1. **Which models are available** (from Step 2)
2. **Your region/country** (from Step 3)
3. **Any error messages** from Step 4 (if you tested)
4. **Confirmation** that the API is enabled (from Step 1)

Then I can update the code with the exact model name that works for your account!

---

## Quick Links Summary

- **Enable API**: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- **Check API Keys**: https://makersuite.google.com/app/apikey
- **Model Documentation**: https://ai.google.dev/models/gemini
- **Google Cloud Console**: https://console.cloud.google.com/

---

## Common Issues & Solutions

### Issue: "404 Model Not Found"
**Solution**: The model name might be different for your account. Check Step 2 to see available models.

### Issue: "API Key Invalid"
**Solution**: 
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Make sure Generative Language API is enabled

### Issue: "Quota Exceeded"
**Solution**: 
1. Check your usage at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. You might need to enable billing or wait for quota reset

### Issue: "API Not Enabled"
**Solution**: 
1. Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click "Enable"
3. Wait 2-3 minutes for activation
