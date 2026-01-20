// MyAI - Uses Hugging Face Inference Providers (router API)
// Works from any device; requires a server-side Hugging Face token.

interface AIMessage {
  role: string;
  content: string;
  imageData?: string;
}

export class MyAI {
  // Hugging Face Inference Providers router (OpenAI-style Chat Completions)
  private apiUrl: string = "https://router.huggingface.co/v1/chat/completions";
  // Try multiple models - use the first one that works
  private modelNames: string[] = [
    "meta-llama/Meta-Llama-3.1-8B-Instruct:fastest",
    "Qwen/Qwen2.5-7B-Instruct:fastest",
    "mistralai/Mistral-7B-Instruct-v0.3:fastest",
    "google/gemma-2-2b-it:fastest",
  ];
  private modelName: string = "meta-llama/Meta-Llama-3.1-8B-Instruct:fastest";
  
  constructor() {
    this.modelName = this.modelNames[0];
  }

  async generateResponse(
    messages: AIMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    codingMode: boolean = false,
    imageData?: string
  ): Promise<string> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // If no API key is set, instruct the user to add one (avoid local fallback per request)
    if (!apiKey) {
      return Promise.resolve(
        "Error: Missing Hugging Face API key. Please set HUGGINGFACE_API_KEY in .env.local and Vercel Environment Variables."
      );
    }

    try {
      // Guardrails: router/provider models can become unstable at extreme settings.
      // We keep the sliders meaningful by mapping UI ranges into a "safe but expressive" range.
      const rawTemperature = Math.max(0, Math.min(2, temperature));
      // Map 0..2 -> 0..1.3 (keeps "max creativity" noticeably higher without going off rails)
      const safeTemperature = rawTemperature <= 1 ? rawTemperature : 1 + (rawTemperature - 1) * 0.3;

      const rawMaxTokens = Math.max(100, Math.min(4000, maxTokens));
      // Map 100..4000 -> 128..1024
      const safeMaxTokens = Math.round(128 + ((rawMaxTokens - 100) / (4000 - 100)) * (1024 - 128));

      const verbosityHint =
        rawMaxTokens >= 3500
          ? "Be extremely detailed and thorough. Explain step-by-step, give multiple methods, add examples/analogies, and include a short recap at the end."
          : rawMaxTokens >= 2500
            ? "Be very detailed. Explain step-by-step and include helpful examples."
            : rawMaxTokens >= 1500
              ? "Be moderately detailed. Explain your reasoning clearly."
              : rawMaxTokens >= 800
                ? "Be concise but include key steps."
                : "Be brief and direct.";

      const creativityHint =
        rawTemperature >= 1.8
          ? "Be maximally creative while staying correct: use vivid analogies, intuitive explanations, and interesting context."
          : rawTemperature >= 1.2
            ? "Be somewhat creative: use a helpful analogy or intuition when appropriate."
            : "Stay factual and focused.";

      // Build message list (OpenAI-style). Always add a system message to reduce junk output.
      const outboundMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content:
            [
              "You are a helpful assistant.",
              "Respond in clean plain text.",
              "Use ONE language consistently.",
              "Do not output garbled characters, random tokens, or repeated noise.",
              "If you don't know, say you don't know.",
              verbosityHint,
              creativityHint,
            ].join(" "),
        },
      ];
      if (codingMode) {
        outboundMessages.push({
          role: "system",
          content:
            "Coding mode: provide correct code and practical steps. Use markdown code blocks only when needed.",
        });
      }
      for (const m of messages) {
        if (m.role !== "system" && m.role !== "user" && m.role !== "assistant") continue;
        // Note: image support depends on the chosen model/provider; this implementation is text-only.
        outboundMessages.push({ role: m.role as any, content: m.content });
      }

      const requestBodyBase: any = {
        messages: outboundMessages,
        temperature: safeTemperature,
        top_p: 0.9,
        max_tokens: Math.max(32, Math.min(1024, safeMaxTokens)),
        stream: false,
      };

      // Try multiple models if one fails
      let lastError: any = null;
      
      const looksCorrupted = (text: string) => {
        const t = text || "";
        // Common corruption patterns from bad generations / encoding artifacts.
        if (/\uFFFD/.test(t)) return true; // replacement char
        if (/ð\s*separat/i.test(t)) return true;
        // Excessive non-ascii often indicates a runaway corrupted stream.
        const nonAscii = (t.match(/[^\x09\x0A\x0D\x20-\x7E]/g) || []).length;
        return t.length > 200 && nonAscii / t.length > 0.15;
      };

      const tryRequest = async (model: string, override?: Partial<typeof requestBodyBase>) => {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            ...requestBodyBase,
            ...override,
            model,
          }),
        });
        return response;
      };

      for (const model of this.modelNames) {
        try {
          const response = await tryRequest(model);

          if (response.ok) {
            const data = await response.json();
            // Success! Use this model going forward
            this.modelName = model;
            const text = this.extractResponse(data);

            // If the output looks corrupted, retry once with safer settings.
            if (looksCorrupted(text)) {
              const retry = await tryRequest(model, { temperature: 0.2, top_p: 0.8, max_tokens: 256 });
              if (retry.ok) {
                const retryData = await retry.json();
                const retryText = this.extractResponse(retryData);
                if (!looksCorrupted(retryText)) return retryText;
              }
            }

            return text;
          }

          // Auth / permission issues: stop early with actionable message
          if (response.status === 401 || response.status === 403) {
            return "Error: Your Hugging Face token is missing permission for Inference Providers. Create a new token with Inference Providers access, set it as HUGGINGFACE_API_KEY on Vercel, then redeploy.";
          }
          
          if (response.status === 429) {
            return "Rate limit reached. Please wait a moment and try again.";
          }

          // Other errors - try next model
          const errText = await response.text().catch(() => "");
          lastError = new Error(
            `Model ${model}: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ""}`
          );
          continue;
        } catch (err) {
          lastError = err;
          continue; // Try next model
        }
      }

      // All models failed
      return `Cloud AI error: All models unavailable. Last error: ${lastError?.message || "Unknown"}. Try again later, or switch Free Mode to Gemini by setting GOOGLE_GEMINI_API_KEY on Vercel.`;
      
    } catch (error: any) {
      console.error("Hugging Face Router API Error:", error);
      
      const errorMsg = error.message || String(error);
      
      if (errorMsg.includes("fetch") || errorMsg.includes("Failed to fetch")) {
        return "Error: Could not connect to the cloud AI service. Please check your internet connection.";
      } else if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
        return "Rate limit reached on the free cloud model. Please wait and try again.";
      } else if (errorMsg.includes("503")) {
        return "The cloud model is loading. Please wait 10-20 seconds and try again.";
      } else {
        return `Cloud AI error: ${errorMsg}.`;
      }
    }
  }

  private extractResponse(data: any): string {
    // OpenAI-style response (Inference Providers router)
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content.trim();

    // Fallbacks for unexpected formats
    if (typeof data === "string") return data.trim();
    const jsonStr = JSON.stringify(data);
    const textMatch = jsonStr.match(/"content":"([^"]+)"/) || jsonStr.match(/"text":"([^"]+)"/);
    if (textMatch) return textMatch[1].trim();

    return "Received unexpected response format from AI service.";
  }
}
