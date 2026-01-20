"use client";

// Disable prerendering for this page to allow useSearchParams without a suspense boundary
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Send, Image as ImageIcon, Settings, EyeOff, Command, ThumbsUp, Home, User, Copy, Check, Sparkles } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import CommandsPanel from "@/components/CommandsPanel";
import FeedbackPanel from "@/components/FeedbackPanel";
import AccountSettings from "@/components/AccountSettings";
import CreatorControls from "@/components/CreatorControls";
import { saveChat, getChatMessages } from "@/lib/chatStorage";
import { getSessionId, getChatsFromDB, getChatMessagesFromDB, saveChatToDB } from "@/lib/db/chatStorage";
import { getSupabaseClient } from "@/lib/supabase";

interface Command {
  id: string;
  command: string;
  replacement: string;
}

interface Message {
  role: string;
  content: string;
  imageUrls?: string[];
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("chatId");
  const [chatId, setChatId] = useState<string>(() => urlChatId || `chat-${Date.now()}`);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedAI, setSelectedAI] = useState("myai");
  const [isLoading, setIsLoading] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showCreatorControls, setShowCreatorControls] = useState(false);
  const [creatorUnlocked, setCreatorUnlocked] = useState(false);
  const [apiKeys, setApiKeys] = useState({ openai: "", gemini: "", claude: "" });
  const [codingMode, setCodingMode] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [commands, setCommands] = useState<Command[]>([]);
  const [keepItems, setKeepItems] = useState<string[]>([]);
  const [stopItems, setStopItems] = useState<string[]>([]);
  const [commandPreview, setCommandPreview] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [showStickyQuestion, setShowStickyQuestion] = useState(false);
  const [lastUserQuestion, setLastUserQuestion] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [background, setBackground] = useState<string>(""); // Custom background (image or color)
  const [transparentMessages, setTransparentMessages] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // Authenticated user
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Check authentication status
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    }).catch((err) => {
      console.error('Error getting user:', err);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Load commands from localStorage
  useEffect(() => {
    const savedCommands = localStorage.getItem("ai-chat-commands");
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands));
    }
    
    // Check if creator controls are unlocked
    const unlocked = localStorage.getItem("creator-unlocked") === "true";
    setCreatorUnlocked(unlocked);

    // Load API keys
    const savedKeys = localStorage.getItem("ai-chat-api-keys");
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKeys(keys);
      } catch (e) {
        console.error("Failed to load API keys");
      }
    }

    // Load coding mode
    const coding = localStorage.getItem("coding-mode") === "true";
    setCodingMode(coding);

    // Load theme preference
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Load background preference (image or color)
    const savedImage = localStorage.getItem("custom-background-image");
    const savedColor = localStorage.getItem("custom-background-color");
    if (savedImage) {
      setBackground(savedImage);
    } else if (savedColor) {
      setBackground(savedColor);
    } else {
      // Default dark navy background
      setBackground("#0f172a");
    }

    // Load transparent messages preference
    const savedTransparent = localStorage.getItem("transparent-messages") === "true";
    setTransparentMessages(savedTransparent);
  }, []);

  // Apply theme to document and update background if no custom background is set
  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Update background based on theme if no custom background is set
    const savedImage = localStorage.getItem("custom-background-image");
    const savedColor = localStorage.getItem("custom-background-color");
    
    if (!savedImage && !savedColor) {
      // No custom background, use theme-based default
      if (theme === "light") {
        setBackground("#ffffff"); // White for light mode
      } else {
        setBackground("#0f172a"); // Dark navy for dark mode
      }
    }
  }, [theme]);

  // Load chat messages when chatId is provided in URL, or create new chat if none
  useEffect(() => {
    const loadChat = async () => {
      const urlChatId = searchParams.get("chatId");
      const isNewChat = searchParams.get("new") !== null;

      if (isNewChat || (!urlChatId || !urlChatId.startsWith("chat-"))) {
        // "Start New Chat" was clicked OR no valid chatId - ALWAYS create a completely new chat
        const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setChatId(newChatId);
        setMessages([]); // Clear ALL messages
        setSelectedAI("myai"); // Reset to default AI
        // Update URL to include the new chatId (remove the "new" param)
        window.history.replaceState({}, "", `/chat?chatId=${newChatId}`);
        return;
      }

      // URL has a chatId - load that existing chat
      if (urlChatId && urlChatId.startsWith("chat-")) {
        setChatId(urlChatId);
        
        // Try to load from database first
        try {
          const dbMessages = await getChatMessagesFromDB(urlChatId);
          if (dbMessages && dbMessages.length > 0) {
            setMessages(dbMessages);
            // Try to get AI model from database
            const dbChats = await getChatsFromDB();
            const chat = dbChats.find((c: any) => c.id === urlChatId);
            if (chat?.aiModel) {
              setSelectedAI(chat.aiModel);
            }
            return;
          }
        } catch (error) {
          console.error('Error loading from database, falling back to localStorage:', error);
        }
        
        // Fallback to localStorage
        const savedMessages = getChatMessages(urlChatId);
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
          const chats = JSON.parse(localStorage.getItem("ai-chat-history") || "[]");
          const chat = chats.find((c: any) => c.id === urlChatId);
          if (chat?.aiModel) {
            setSelectedAI(chat.aiModel);
          }
        } else {
          // If chatId provided but no messages found, start fresh
          setMessages([]);
        }
      }
    };
    
    loadChat();
  }, [searchParams]);

  // Save commands to localStorage
  useEffect(() => {
    if (commands.length > 0) {
      localStorage.setItem("ai-chat-commands", JSON.stringify(commands));
    }
  }, [commands]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track scroll position and show sticky question header
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Show sticky header when scrolled down (more than 200px from top)
      if (scrollTop > 200) {
        // Find the last user question
        const lastUserMsg = messages.filter(m => m.role === "user").pop();
        if (lastUserMsg) {
          setLastUserQuestion(lastUserMsg.content.substring(0, 100) + (lastUserMsg.content.length > 100 ? "..." : ""));
          setShowStickyQuestion(true);
        }
      } else {
        setShowStickyQuestion(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages]);

  // Copy message to clipboard
  const handleCopyMessage = async (messageContent: string, messageIdx: number) => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopiedMessageId(messageIdx);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Load last question into input box for editing
  const loadLastQuestionForEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the LAST user message (most recent) - get FULL text, not truncated
    const lastUserMsg = messages.filter(m => m.role === "user").pop();
    if (lastUserMsg) {
      // Set the full question text in the input
      setInput(lastUserMsg.content);

      // Focus the textarea input box
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder*="Type your message"]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          // Move cursor to end of text
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }, 50);
    }
  };

  // Command detection and preview
  useEffect(() => {
    const words = input.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("/") && lastWord.length > 1) {
      const cmd = commands.find((c) => c.command === lastWord);
      if (cmd) {
        setCommandPreview(cmd.replacement);
      } else {
        setCommandPreview(null);
      }
    } else {
      setCommandPreview(null);
    }
  }, [input, commands]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const processCommand = (text: string): string => {
    let processed = text;
    commands.forEach((cmd) => {
      const regex = new RegExp(`\\${cmd.command}\\b`, "g");
      processed = processed.replace(regex, cmd.replacement);
    });
    return processed;
  };

  const buildSystemPrompt = (): string => {
    let prompt = "";
    if (keepItems.length > 0) {
      prompt += "Things to do more often:\n";
      keepItems.forEach((item) => {
        prompt += `- ${item}\n`;
      });
      prompt += "\n";
    }
    if (stopItems.length > 0) {
      prompt += "Things to avoid:\n";
      stopItems.forEach((item) => {
        prompt += `- ${item}\n`;
      });
    }
    return prompt.trim();
  };

  // Convert image file to base64 with format detection
  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Extract mime type and base64 data
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          resolve({ data: match[2], mimeType: match[1] });
        } else {
          // Fallback: assume it's already base64
          resolve({ data: dataUrl, mimeType: 'image/png' });
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Save the input and clear it IMMEDIATELY (before any async operations)
    const currentInput = input.trim();
    const currentImages = [...selectedImages];

    // Clear input box immediately so user can type next question
    setInput("");
    setSelectedImages([]);
    setCommandPreview(null);
    setIsLoading(true);

    // Clean input - remove any length instructions that might have been added
    let cleanInput = currentInput;
    let processedInput = processCommand(cleanInput);
    const systemPrompt = buildSystemPrompt();

    // Convert images to base64
    let imageData: string | undefined = undefined;
    let imageMimeType: string | undefined = undefined;
    if (currentImages.length > 0) {
      // For now, process the first image (can be extended to handle multiple)
      try {
        const imageInfo = await fileToBase64(currentImages[0]);
        imageData = imageInfo.data;
        imageMimeType = imageInfo.mimeType;
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }

    const userMessage: Message = {
      role: "user",
      content: processedInput,
      imageUrls: currentImages.length > 0 ? currentImages.map((f) => URL.createObjectURL(f)) : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const messagesToSend = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        {
          role: "user",
          content: processedInput,
          imageData: imageData // Include base64 image data
        },
      ];

      // Debug: Check if API keys are loaded
      console.log("Sending request with API keys:", {
        openai: apiKeys.openai ? "***" + apiKeys.openai.slice(-4) : "NOT SET",
        model: selectedAI,
        hasImage: !!imageData
      });

      // Get session ID for analytics tracking
      const sessionId = getSessionId();
      console.log("=== FRONTEND: About to send message ===");
      console.log("Session ID:", sessionId || "MISSING - Analytics won't work!");
      console.log("Chat ID:", chatId || "MISSING!");
      console.log("Incognito mode:", incognitoMode);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          model: selectedAI,
          temperature,
          max_tokens: maxTokens,
          incognito: incognitoMode,
          apiKeys: apiKeys,
          codingMode: codingMode,
          imageData: imageData, // Send image data separately for MyAI
          imageMimeType: imageMimeType, // Send mime type for proper format handling
          chatId: chatId, // Include chatId for saving chats
          sessionId: sessionId, // Include sessionId for analytics tracking
          authUserId: user?.id || null, // Include authenticated user ID if logged in
          authUserEmail: user?.email || null, // Include authenticated user email if logged in
        }),
      });

      const data = await response.json();

      if (data.error) {
        const errorMessage: Message = { role: "assistant", content: `Error: ${data.error}` };
        const updatedMessages = [...messages, userMessage, errorMessage];
        setMessages(updatedMessages);

        // Save chat history (if not incognito) - database save happens in API route
        // Also save to localStorage as backup
        if (!incognitoMode) {
          saveChat(chatId, updatedMessages, selectedAI, incognitoMode);
        }
      } else {
        const assistantMessage: Message = { role: "assistant", content: data.message };
        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);

        // Save chat history (if not incognito)
        if (!incognitoMode) {
          // Save to database
          try {
            await saveChatToDB(chatId, updatedMessages, selectedAI, incognitoMode, user?.id);
          } catch (error) {
            console.error('Error saving to database:', error);
          }
          // Also save to localStorage as backup
          saveChat(chatId, updatedMessages, selectedAI, incognitoMode);
        }
      }
    } catch (error) {
      const errorMessage: Message = { role: "assistant", content: "Failed to get response. Please check your API key." };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Theme helper classes
  const themeClasses = {
    bg: theme === "dark" ? "bg-gray-900" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-800" : "border-gray-200",
    hover: theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
    input: theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300",
    button: theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300",
    messageUser: theme === "dark" ? "bg-blue-600" : "bg-blue-500",
    messageAI: theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300",
    sticky: theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
  };

  // Background style - check if it's a data URL (image) or color
  const backgroundStyle = background
    ? background.startsWith("data:") || background.startsWith("http") || background.startsWith("/")
      ? { backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
      : { backgroundColor: background }
    : { backgroundColor: "#0f172a" }; // Default dark navy

  return (
    <div className={`flex flex-col h-screen ${themeClasses.text}`} style={backgroundStyle}>
      {/* Header */}
      <header className={`border-b p-4 flex items-center justify-between ${themeClasses.border}`} style={{ backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className={`p-1 rounded ${themeClasses.hover}`}>
            <Home size={20} />
          </Link>
          <h1 className="text-xl font-semibold">TREXAI</h1>
          {incognitoMode && (
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <EyeOff size={16} />
              <span>Incognito</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {creatorUnlocked && (
            <button
              onClick={() => setShowCreatorControls(true)}
              className={`p-2 rounded flex items-center gap-2 ${themeClasses.hover}`}
              title="Creator Controls"
            >
              <Sparkles size={18} />
            </button>
          )}
          <button
            onClick={() => setShowAccountSettings(true)}
            className={`p-2 rounded flex items-center gap-2 ${themeClasses.hover}`}
            title="Account Settings"
          >
            <User size={18} />
          </button>
          <button
            onClick={() => setShowCommands(true)}
            className={`p-2 rounded flex items-center gap-2 ${themeClasses.hover}`}
            title="Commands"
          >
            <Command size={18} />
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className={`p-2 rounded flex items-center gap-2 ${themeClasses.hover}`}
            title="Preferences"
          >
            <ThumbsUp size={18} />
          </button>
          <select
            value={selectedAI}
            onChange={(e) => setSelectedAI(e.target.value)}
            className={`${themeClasses.input} rounded px-3 py-1`}
          >
            <option value="myai">myai (Free)</option>
            <option value="openai">
              ChatGPT {apiKeys.openai ? "(API Key)" : "(API Key Required)"}
            </option>
            <option value="gemini">
              Gemini {apiKeys.gemini ? "(API Key)" : "(API Key Required)"}
            </option>
            <option value="claude">
              Claude {apiKeys.claude ? "(API Key)" : "(API Key Required)"}
            </option>
          </select>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded ${themeClasses.hover}`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Sticky Question Header */}
      {showStickyQuestion && lastUserQuestion && (
        <div className={`sticky top-0 z-10 ${themeClasses.sticky} border-b px-4 py-2`}>
          <button
            onClick={loadLastQuestionForEdit}
            className={`w-full text-left text-sm transition-colors truncate ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            title="Click to edit this question"
          >
            {lastUserQuestion}
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className={`text-center mt-20 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            <p className="text-xl mb-2">Start a conversation</p>
            <p className="text-sm">Ask me anything!</p>
            <p className={`text-xs mt-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              Use /commands to set up custom shortcuts
            </p>
            {!apiKeys.openai && !apiKeys.gemini && !apiKeys.claude && (
              <div className={`mt-6 max-w-md mx-auto rounded-lg p-4 ${theme === "dark" ? "bg-blue-900 border-blue-700" : "bg-blue-100 border-blue-300"} border`}>
                <p className={`text-sm ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>
                  💡 <strong>Free Mode Active:</strong> Using the site&apos;s free AI backend. Add API keys in Account Settings (👤) to use ChatGPT/Gemini/Claude.
                </p>
              </div>
            )}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            ref={(el) => {
              if (el) messageRefs.current.set(idx, el);
            }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 relative group ${
                transparentMessages
                  ? "bg-transparent border-transparent"
                  : msg.role === "user"
                  ? themeClasses.messageUser
                  : `${themeClasses.messageAI} border`
              }`}
            >
              {msg.imageUrls && msg.imageUrls.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {msg.imageUrls.map((url, imgIdx) => (
                    <Image
                      key={imgIdx}
                      src={url}
                      alt={`Upload ${imgIdx + 1}`}
                      width={200}
                      height={200}
                      className="max-w-xs max-h-48 rounded object-cover"
                      unoptimized
                    />
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Copy button - only for assistant messages, bottom right */}
              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopyMessage(msg.content, idx)}
                  className={`absolute bottom-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
                  title="Copy response"
                >
                  {copiedMessageId === idx ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`${
              transparentMessages
                ? "bg-transparent border-transparent"
                : `${themeClasses.messageAI} border`
            } rounded-lg p-4`}>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

        {/* Input Area */}
        <div className={`border-t p-4 ${themeClasses.border}`} style={{ backgroundColor: 'transparent' }}>
        {/* Command Preview */}
        {commandPreview && (
          <div className="max-w-4xl mx-auto mb-2 px-2">
            <div className={`rounded px-3 py-1 text-sm ${theme === "dark" ? "bg-blue-900 border-blue-700" : "bg-blue-100 border-blue-300"} border`}>
              <span className={theme === "dark" ? "text-blue-300" : "text-blue-800"}>Command preview:</span>{" "}
              <span className="font-mono">{commandPreview}</span>
            </div>
          </div>
        )}

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="max-w-4xl mx-auto mb-2 px-2 flex gap-2 flex-wrap">
            {selectedImages.map((file, idx) => (
              <div key={idx} className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  width={80}
                  height={80}
                  className={`w-20 h-20 object-cover rounded border ${themeClasses.border}`}
                  unoptimized
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded ${themeClasses.hover}`}
            title="Upload images"
          >
            <ImageIcon size={20} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message... (Use /commands to set up shortcuts)"
            className={`flex-1 ${themeClasses.input} rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500 ${themeClasses.text}`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        incognitoMode={incognitoMode}
        onIncognitoChange={setIncognitoMode}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        theme={theme}
        onThemeChange={setTheme}
        background={background}
        onBackgroundChange={setBackground}
        transparentMessages={transparentMessages}
        onTransparentMessagesChange={(value) => {
          setTransparentMessages(value);
          localStorage.setItem("transparent-messages", value.toString());
        }}
      />
      <CommandsPanel
        isOpen={showCommands}
        onClose={() => setShowCommands(false)}
        commands={commands}
        onCommandsChange={setCommands}
        theme={theme}
      />
      <FeedbackPanel
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        keepItems={keepItems}
        stopItems={stopItems}
        onKeepChange={setKeepItems}
        onStopChange={setStopItems}
        theme={theme}
      />
      <AccountSettings
        isOpen={showAccountSettings}
        onClose={() => {
          // Reload API keys when closing settings
          const savedKeys = localStorage.getItem("ai-chat-api-keys");
          if (savedKeys) {
            try {
              const keys = JSON.parse(savedKeys);
              setApiKeys(keys);
            } catch (e) {
              console.error("Failed to load API keys");
            }
          }
          setShowAccountSettings(false);
        }}
        onApiKeysChange={(keys) => {
          setApiKeys(keys);
          localStorage.setItem("ai-chat-api-keys", JSON.stringify(keys));
          console.log("API keys updated:", { openai: keys.openai ? "***" + keys.openai.slice(-4) : "not set" });
        }}
        onGitHubChange={(connected, token) => {
          if (connected && token) {
            localStorage.setItem("github-token", token);
          } else {
            localStorage.removeItem("github-token");
          }
        }}
        onCodingModeChange={(enabled) => {
          setCodingMode(enabled);
          localStorage.setItem("coding-mode", enabled.toString());
        }}
        theme={theme}
      />
      <CreatorControls
        isOpen={showCreatorControls}
        onClose={() => setShowCreatorControls(false)}
        theme={theme}
      />
    </div>
  );
}
