// Test script to check which Gemini models work with your API key
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCtBL4cXedUPHgrtkFlGjg7YfOrnxU1bv0";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModels() {
  console.log("Testing Gemini API with your key...\n");
  console.log("API Key:", API_KEY.substring(0, 20) + "...\n");
  
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro",
    "gemini-1.0-pro"
  ];
  
  let workingModel = null;
  
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello in one word");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! ${modelName} works!`);
      console.log(`   Response: ${text}\n`);
      
      if (!workingModel) {
        workingModel = modelName;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${modelName}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  if (workingModel) {
    console.log(`\n🎉 Found working model: ${workingModel}`);
    console.log(`\nShare this with me: "The working model is: ${workingModel}"`);
  } else {
    console.log("\n❌ No models worked. Please check:");
    console.log("   1. Is the Generative Language API enabled?");
    console.log("   2. Is your API key valid?");
    console.log("   3. Do you have access to Gemini models?");
  }
}

testModels().catch(console.error);
