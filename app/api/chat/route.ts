import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { MyAI } from "@/lib/myai";
import { getOrCreateUser, trackAnalyticsEvent, saveChatToDB } from "@/lib/db/chatStorage";
import { createSupabaseAdmin } from "@/lib/supabase";

// Helper function to get length instruction based on maxTokens
function getLengthInstruction(maxTokens: number): string {
  if (maxTokens <= 500) {
    return "Answer in a very short, concise way. Be brief and direct.";
  } else if (maxTokens <= 1000) {
    return "Answer in a short, concise way.";
  } else if (maxTokens <= 2000) {
    return "Answer in a moderate length, providing good detail.";
  } else if (maxTokens <= 3000) {
    return "Answer in a detailed, comprehensive way. Provide thorough explanations.";
  } else {
    return "Answer in a super detailed, long, smart way of thinking that explains everything needed. Be comprehensive and thorough.";
  }
}

// Save chat to DB on server (called after each successful AI response)
async function saveChatAfterResponse(
  chatId: string,
  messages: any[],
  model: string,
  incognito: boolean,
  sessionId: string | null,
  authUserId: string | null,
  authUserEmail: string | null,
  response: string
): Promise<void> {
  // Save to DB when we have a user (logged in or session). Include incognito so creator can see full history.
  if (!chatId) return;
  const clean = (m: any) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : (m.content?.[0]?.text ?? '') });
  const fullMessages = [...messages.map(clean), { role: 'assistant' as const, content: response }];
  try {
    await saveChatToDB(chatId, fullMessages, model, incognito, authUserId ?? undefined, sessionId ?? undefined, authUserEmail ?? undefined);
  } catch (e) {
    console.error('Failed to save chat after response:', e);
  }
}

// MyAI is now the default free AI - see lib/myai.ts

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      model, 
      temperature = 0.7, 
      max_tokens = 2000, 
      incognito,
      apiKeys = {},
      codingMode = false,
      imageData,
      imageMimeType = 'image/png',
      chatId,
      sessionId,
      authUserId,
      authUserEmail,
      displayName
    } = await request.json();

    const incognitoFlag = incognito === true;

    // Prefer verified user from Bearer token (server-side) over body (client can be wrong)
    let verifiedAuthUserId: string | null = (authUserId && typeof authUserId === 'string') ? authUserId : null;
    let verifiedAuthUserEmail: string | null = (authUserEmail && typeof authUserEmail === 'string') ? authUserEmail : null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "").trim();
        const adminClient = createSupabaseAdmin();
        const { data: { user: tokenUser }, error } = await adminClient.auth.getUser(token);
        if (!error && tokenUser) {
          verifiedAuthUserId = tokenUser.id;
          verifiedAuthUserEmail = tokenUser.email ?? null;
        }
      } catch (e) {
        console.error("Chat API: token verification failed", e);
      }
    }

    console.log("=== API REQUEST START ===");
    console.log("API received - sessionId:", sessionId || "MISSING!", "chatId:", chatId || "MISSING!", "incognito:", incognitoFlag, "authUserId:", verifiedAuthUserId || "MISSING");
    console.log("=== API REQUEST START ===");

    // Track analytics and get user ID - MUST happen BEFORE processing the message
    let userId: string | null = null;
    if (!incognitoFlag && sessionId) {
      try {
        console.log("=== ANALYTICS TRACKING START ===");
        console.log("Session ID:", sessionId);
        console.log("Incognito mode:", incognitoFlag);
        
        userId = await getOrCreateUser(sessionId, verifiedAuthUserId ?? undefined, verifiedAuthUserEmail ?? undefined);
        console.log("User ID:", userId || "NULL - User creation failed!");
        
        if (!userId) {
          console.error("CRITICAL: Failed to get/create user. Analytics will not work!");
        } else {
          // Save display name for anonymous users (so it shows in User management)
          const nameToSave = typeof displayName === 'string' ? displayName.trim() : null;
          if (nameToSave) {
            try {
              const adminClient = createSupabaseAdmin();
              await adminClient.from('users').update({ display_name: nameToSave }).eq('id', userId);
            } catch (_) {}
          }
          // Track message sent event IMMEDIATELY - before any other processing
          console.log("Tracking analytics event - userId:", userId, "model:", model);
          try {
            await trackAnalyticsEvent(userId, 'message_sent', model, {
              has_image: !!imageData,
              coding_mode: codingMode,
            });
            console.log("? Analytics event tracked successfully");
          } catch (analyticsError: any) {
            console.error("? Failed to track analytics event:", analyticsError);
            console.error("Error details:", analyticsError?.message, analyticsError?.code, analyticsError?.details);
          }
          
          // Update user's last_active and increment message_count
          try {
            const adminClient = createSupabaseAdmin();
            // Get current message count
            const { data: userData, error: userError } = await adminClient
              .from('users')
              .select('message_count')
              .eq('id', userId)
              .single();
            
            if (userError) {
              console.error("Error fetching user data:", userError);
            } else {
              const currentCount = userData?.message_count || 0;
              
              // Update last_active and increment message_count
              const { error: updateError } = await adminClient
                .from('users')
                .update({ 
                  last_active: new Date().toISOString(),
                  message_count: currentCount + 1
                })
                .eq('id', userId);
              
              if (updateError) {
                console.error("Error updating user:", updateError);
              } else {
                console.log("? User updated - message_count:", currentCount + 1);
              }
            }
          } catch (updateError: any) {
            console.error("? Failed to update user:", updateError);
          }
          
          // Check rate limits AFTER tracking (so we have the event in the DB)
          try {
            const adminClient = createSupabaseAdmin();
            const { data: settings } = await adminClient
              .from('creator_settings')
              .select('setting_value')
              .eq('setting_key', 'rate_limit')
              .single();

            const rateLimits = settings?.setting_value || { enabled: false };

            if (rateLimits.enabled) {
              const now = new Date();
              const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
              const todayStart = new Date(now.setHours(0, 0, 0, 0));

              // Check messages per minute
              const { count: recentMessages } = await adminClient
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'message_sent')
                .gte('created_at', oneMinuteAgo.toISOString());

              if (recentMessages && recentMessages >= (rateLimits.messagesPerMinute || 10)) {
                return NextResponse.json(
                  { error: 'Rate limit exceeded: too many messages per minute' },
                  { status: 429 }
                );
              }

              // Check daily cap
              const { count: todayMessages } = await adminClient
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'message_sent')
                .gte('created_at', todayStart.toISOString());

              if (todayMessages && todayMessages >= (rateLimits.dailyCap || 100)) {
                return NextResponse.json(
                  { error: 'Daily usage cap reached' },
                  { status: 429 }
                );
              }
            }
          } catch (error) {
            console.error('Error checking rate limits:', error);
            // Continue on error (fail open)
          }
        }
        
        console.log("=== ANALYTICS TRACKING END ===");
      } catch (error: any) {
        console.error('? Error in analytics tracking block:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        // Continue even if analytics fails - don't break the chat
      }
    } else {
      console.log("Analytics skipped - incognito:", incognitoFlag, "sessionId:", sessionId);
    }
    
    // Check content moderation
    try {
      const adminClient = createSupabaseAdmin();
      const { data: moderationSettings } = await adminClient
        .from('creator_settings')
        .select('setting_value')
        .eq('setting_key', 'moderation')
        .single();
      
      if (moderationSettings?.setting_value?.enabled) {
        const blockedWords = (moderationSettings.setting_value.blockedWords || '')
          .split('\n')
          .map((w: string) => w.trim().toLowerCase())
          .filter((w: string) => w.length > 0);
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          const messageText = lastMessage.content.toLowerCase();
          for (const word of blockedWords) {
            if (messageText.includes(word)) {
              return NextResponse.json(
                { error: 'Your message contains content that violates our guidelines.' },
                { status: 400 }
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking moderation:', error);
      // Continue even if moderation check fails
    }

    // Debug: Log if API keys are received (don't log the actual keys)
    console.log("API Request - Model:", model, "Has API keys:", {
      openai: !!apiKeys?.openai,
      gemini: !!apiKeys?.gemini,
      claude: !!apiKeys?.claude,
      hasImage: !!imageData
    });

    // MyAI - Uses Hugging Face Inference API (server-side)
    if (model === "myai") {
      console.log("Using MyAI (Hugging Face Inference API)");
      // "Free mode" still requires the site owner to configure a server-side key.
      // Users do NOT need to provide keys for MyAI.
      if (!process.env.HUGGINGFACE_API_KEY) {
        return NextResponse.json(
          {
            error:
              "Free mode is not configured on this deployment. The site owner must set HUGGINGFACE_API_KEY in Vercel Environment Variables (or in .env.local for local dev).",
          },
          { status: 400 }
        );
      }
      // MyAI (free Hugging Face models) doesn't support vision/images
      if (imageData) {
        return NextResponse.json({
          error: "Image uploads are not supported with MyAI (free mode). Please use ChatGPT, Gemini, or Claude for image analysis. Add your API keys in Account Settings (?? icon).",
        }, { status: 400 });
      }

      const myAI = new MyAI();
      const response = await myAI.generateResponse(
        messages,
        temperature,
        max_tokens,
        codingMode
      );
      
      await saveChatAfterResponse(chatId, messages, model, incognitoFlag, sessionId, verifiedAuthUserId, verifiedAuthUserEmail, response);
      
      return NextResponse.json({
        message: response,
      });
    }

    if (model === "openai") {
      // REQUIRED: User must provide their own API key
      const apiKey = apiKeys?.openai?.trim();
      
      if (!apiKey) {
        return NextResponse.json(
          { 
            error: "OpenAI API key required! Click the ?? icon in the header, add your OpenAI API key, and click Save Settings. Get your key at: https://platform.openai.com/api-keys" 
          },
          { status: 400 }
        );
      }

      // User provided API key - use OpenAI
      console.log("Using user's OpenAI API key");

      const openai = new OpenAI({ apiKey });

      // Filter out system messages if incognito mode (for privacy)
      const filteredMessages = incognitoFlag
        ? messages.filter((msg: any) => msg.role !== "system")
        : messages;

      // Add coding mode prompt if enabled and length instruction
      const lengthInstruction = getLengthInstruction(max_tokens);
      let systemMessages = filteredMessages;
      if (codingMode) {
        systemMessages = [
          {
            role: "system",
            content: "You are an expert software developer and web designer. Focus on providing code solutions, best practices, and building complete applications. When asked to build websites, provide full, working code with HTML, CSS, and JavaScript.",
          },
          ...filteredMessages,
        ];
      }
      
      // Add length instruction to the last user message
      const lastMessage = systemMessages[systemMessages.length - 1];
      if (lastMessage && lastMessage.role === "user") {
        lastMessage.content = `${lastMessage.content} ${lengthInstruction}`;
      }

      // Use vision-capable model if image is provided, otherwise use cheaper model
      const openaiModel = imageData ? "gpt-4o" : "gpt-3.5-turbo";
      
      try {
        // Convert messages to OpenAI format, adding image if present
        const openaiMessages = systemMessages.map((msg: any) => {
          if (msg.role === "user" && imageData && msg === systemMessages[systemMessages.length - 1]) {
            // Last user message with image - include image
            return {
              role: "user",
              content: [
                { type: "text", text: msg.content },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${imageMimeType};base64,${imageData}`,
                  },
                },
              ],
            };
          }
          return {
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          };
        });

        const completion = await openai.chat.completions.create({
          model: openaiModel,
          messages: openaiMessages,
          temperature: Math.max(0, Math.min(2, temperature)),
          max_tokens: Math.max(1, Math.min(4000, max_tokens)),
          stream: false,
        });

        const responseText = completion.choices[0]?.message?.content || "No response";
        
        await saveChatAfterResponse(chatId, messages, model, incognitoFlag, sessionId, verifiedAuthUserId, verifiedAuthUserEmail, responseText);
        
        return NextResponse.json({
          message: responseText,
        });
      } catch (openaiError: any) {
        console.error("OpenAI API call failed:", openaiError);
        // If API key fails (quota, invalid, etc.), fallback to free AI
        if (openaiError.status === 429 || openaiError.status === 401) {
          return NextResponse.json(
            { 
              error: `Your OpenAI API key has issues (${openaiError.status === 429 ? "quota exceeded" : "invalid key"}). Please check your key in Account Settings or try using MyAI (no API key needed).` 
            },
            { status: openaiError.status }
          );
        }
        throw openaiError; // Re-throw to be caught by outer catch
      }
    }

    if (model === "gemini") {
      const apiKey = apiKeys?.gemini?.trim();
      
      // REQUIRED: User must provide their own API key
      if (!apiKey) {
        return NextResponse.json(
          { 
            error: "Gemini API key required! Click the ?? icon in the header, add your Gemini API key, and click Save Settings. Get your free key at: https://aistudio.google.com/app/apikey" 
          },
          { status: 400 }
        );
      }

      // User provided API key - use Gemini
      console.log("Using user's Gemini API key");

      try {
        // Use REST API directly for better control and model availability
        // Filter and clean messages
        const filteredMessages = (incognitoFlag
          ? messages.filter((msg: any) => msg.role !== "system")
          : messages
        ).map((msg: any) => {
          // Remove any length instruction text
          let content = msg.content;
          content = content.replace(/Answer in a .*? way\./gi, "").trim();
          content = content.replace(/Be .*?\./gi, "").trim();
          return { ...msg, content };
        }).filter((msg: any) => msg.content.length > 0);

        // Build conversation for chat API
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        
        // Add system instruction if coding mode
        if (codingMode && !incognitoFlag) {
          contents.push({
            role: "user",
            parts: [{ text: "You are an expert software developer. Focus on code solutions." }],
          });
          contents.push({
            role: "model",
            parts: [{ text: "Understood." }],
          });
        }

        // Add conversation messages - skip any that look like error messages
        for (let i = 0; i < filteredMessages.length; i++) {
          const msg = filteredMessages[i];
          if (msg.role === "user" || msg.role === "assistant") {
            // Skip assistant messages that look like error responses
            const content = msg.content.toLowerCase();
            if (msg.role === "assistant" && (
              content.includes("error") && content.includes("api") ||
              content.includes("cannot connect") ||
              content.includes("technical issue") ||
              content.includes("404") ||
              content.includes("not found")
            )) {
              continue; // Skip error-like assistant messages
            }
            
            // If this is the last user message and we have an image, include it
            const isLastUserMessage = msg.role === "user" && i === filteredMessages.length - 1;
            const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];
            
            if (isLastUserMessage && imageData) {
              // Add image part
              parts.push({
                inline_data: {
                  mime_type: imageMimeType || "image/png",
                  data: imageData,
                },
              });
            }
            
            // Add text part (always include, even if empty, for proper format)
            parts.push({ text: msg.content || "" });
            
            contents.push({
              role: msg.role === "assistant" ? "model" : "user",
              parts: parts as any, // Type assertion needed for mixed parts array
            });
          }
        }

        // First, try to list available models
        let modelNames: string[] = [];
        try {
          const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
          const listResponse = await fetch(listUrl);
          if (listResponse.ok) {
            const listData = await listResponse.json();
            // Find all models that support generateContent
            const availableModels = listData.models?.filter((m: any) => 
              m.supportedGenerationMethods?.includes("generateContent") &&
              m.name?.includes("gemini")
            ).map((m: any) => m.name.replace("models/", "")) || [];
            
            if (availableModels.length > 0) {
              modelNames = availableModels;
              console.log("Found available Gemini models:", modelNames);
            }
          }
        } catch (e) {
          console.log("Could not list models:", e);
        }

        // Fallback to common model names if listing failed
        if (modelNames.length === 0) {
          modelNames = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
          ];
        }

        let text: string = "";
        let lastError: any = null;
        let triedModels: string[] = [];

        for (const modelName of modelNames) {
          try {
            const cleanModelName = modelName.replace("models/", "");
            triedModels.push(cleanModelName);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: contents,
                generationConfig: {
                  temperature: Math.max(0, Math.min(1, temperature)),
                  maxOutputTokens: Math.max(1, Math.min(8192, max_tokens)),
                },
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              lastError = new Error(`Model ${cleanModelName}: HTTP ${response.status}`);
              continue; // Try next model
            }

            const data = await response.json();
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Check if response contains error-like text (model might be hallucinating)
            if (text && !text.toLowerCase().includes("error") && !text.toLowerCase().includes("cannot connect") && !text.toLowerCase().includes("technical issue")) {
              console.log("Successfully used Gemini model:", cleanModelName);
              break; // Success!
            } else if (text) {
              // Model responded but with error-like content - might be hallucinating
              console.log("Model responded but content looks like error, trying next model...");
              lastError = new Error(`Model ${cleanModelName} returned error-like response: ${text.substring(0, 100)}`);
              continue;
            }
          } catch (err: any) {
            lastError = err;
            continue; // Try next model
          }
        }

        if (!text) {
          const errorMsg = `Gemini API: None of the available models worked. Tried: ${triedModels.join(", ")}. ` +
            `Please check your API key at https://aistudio.google.com/app/apikey and ensure it has access to Gemini models. ` +
            `Error: ${lastError?.message || "Unknown error"}`;
          throw new Error(errorMsg);
        }

        const responseText = text || "No response";
        
        await saveChatAfterResponse(chatId, messages, model, incognitoFlag, sessionId, verifiedAuthUserId, verifiedAuthUserEmail, responseText);
        
        return NextResponse.json({
          message: responseText,
        });
      } catch (geminiError: any) {
        console.error("Gemini API call failed:", geminiError);
        let errorMessage = "Your Gemini API key has issues. Please check your key in Account Settings.";
        
        if (geminiError.message) {
          if (geminiError.message.includes("API_KEY_INVALID") || geminiError.message.includes("401")) {
            errorMessage = "Invalid Gemini API key. Please check your key in Account Settings (?? icon).";
          } else if (geminiError.message.includes("429") || geminiError.message.includes("quota")) {
            errorMessage = "Gemini API quota exceeded. Please check your usage or try again later.";
          } else {
            errorMessage = `Gemini API error: ${geminiError.message}`;
          }
        }
        
        return NextResponse.json(
          { 
            error: errorMessage
          },
          { status: geminiError.status || 500 }
        );
      }
    }

    if (model === "claude") {
      const apiKey = apiKeys?.claude?.trim();
      
      // REQUIRED: User must provide their own API key
      if (!apiKey) {
        return NextResponse.json(
          { 
            error: "Claude API key required! Click the ?? icon in the header, add your Claude API key, and click Save Settings. Get your key at: https://console.anthropic.com/" 
          },
          { status: 400 }
        );
      }

      // User provided API key - use Claude
      console.log("Using user's Claude API key");

      const anthropic = new Anthropic({ apiKey });

      // Filter out system messages if incognito
      const filteredMessages = incognitoFlag
        ? messages.filter((msg: any) => msg.role !== "system")
        : messages;

      // Add coding mode system message and length instruction
      const lengthInstruction = getLengthInstruction(max_tokens);
      let systemMessage = lengthInstruction;
      if (codingMode) {
        systemMessage = "You are an expert software developer. Focus on code solutions and building applications. " + lengthInstruction;
      }

      // Convert to Claude format with image support
      const claudeMessages = filteredMessages
        .filter((m: any) => m.role !== "system")
        .map((m: any, idx: number) => {
          const isLastUserMessage = m.role === "user" && idx === filteredMessages.length - 1;
          
          if (isLastUserMessage && imageData) {
            // Last user message with image - use vision format
            return {
              role: "user" as const,
              content: [
                {
                  type: "image" as const,
                  source: {
                    type: "base64" as const,
                    media_type: imageMimeType || "image/png",
                    data: imageData,
                  },
                },
                {
                  type: "text" as const,
                  text: m.content,
                },
              ],
            };
          }
          
          return {
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          };
        });

      // Use vision-capable model if image is provided
      const claudeModel = imageData ? "claude-3-5-sonnet-20241022" : "claude-3-sonnet-20240229";

      try {
        const message = await anthropic.messages.create({
          model: claudeModel,
          max_tokens: Math.max(1, Math.min(4000, max_tokens)),
          temperature: Math.max(0, Math.min(1, temperature)),
          system: systemMessage || undefined,
          messages: claudeMessages as any,
        });

        const text = message.content[0].type === "text" ? message.content[0].text : "No response";

        const responseText = text;
        
        await saveChatAfterResponse(chatId, messages, model, incognitoFlag, sessionId, verifiedAuthUserId, verifiedAuthUserEmail, responseText);
        
        return NextResponse.json({
          message: responseText,
        });
      } catch (claudeError: any) {
        console.error("Claude API call failed:", claudeError);
        // Fallback to free AI if API key fails
        return NextResponse.json(
          { 
            error: `Your Claude API key has issues. Please check your key in Account Settings or try using MyAI (no API key needed).` 
          },
          { status: claudeError.status || 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "AI model not supported" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Chat API error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return more detailed error message
    let errorMessage = "Failed to process chat request";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.statusText}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
