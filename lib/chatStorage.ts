// Simple localStorage-based chat history (will upgrade to database later)

export interface Chat {
  id: string;
  title: string;
  summary: string;
  lastMessage: string;
  timestamp: number;
  aiModel: string;
  messageCount: number;
  messages?: any[]; // Full message history
}

const CHAT_GAP_MINUTES = 5; // If last message was > 5 minutes ago, start a new chat

// Get the most recent chat that's still "active" (within time gap) for the same AI model
function getActiveChatId(aiModel: string): string | null {
  try {
    const chats = getChats();
    const recentChat = chats.find((c) => {
      if (c.aiModel !== aiModel) return false;
      const timeSinceLastMessage = Date.now() - c.timestamp;
      return timeSinceLastMessage < CHAT_GAP_MINUTES * 60 * 1000; // 5 minutes in ms
    });
    return recentChat?.id || null;
  } catch (error) {
    return null;
  }
}

export function saveChat(chatId: string, messages: any[], aiModel: string, incognito: boolean = false): string {
  if (incognito) return chatId; // Don't save in incognito mode

  try {
    const chats = getChats();
    const existingChatWithThisId = chats.find((c) => c.id === chatId);
    
    // Time-based grouping logic:
    // - If chatId already exists in saved chats → always use it (you're continuing that chat)
    // - If chatId is brand new (doesn't exist) → ALWAYS save as new chat (never merge)
    //   This ensures "Start New Chat" always creates a separate chat
    // - Time-based grouping only applies when continuing the SAME chatId
    
    let finalChatId = chatId;
    
    // If this chatId doesn't exist yet, it's a brand new chat - NEVER merge it
    // Only use the provided chatId (don't check for active chats)
    // This way "Start New Chat" always creates a separate chat
    
    // If chatId already exists, we're continuing that chat - use it
    // (Time-based grouping happens naturally because we're updating the same chat)
    
    const existingChat = chats.find((c) => c.id === finalChatId);

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    const lastMessage = lastUserMessage?.content || "No messages";

    // Generate a simple title from first message
    let title = "New Chat";
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage?.content) {
      title = firstUserMessage.content.substring(0, 50);
      if (firstUserMessage.content.length > 50) title += "...";
    }

    // Generate summary from first few messages
    let summary = "No summary available";
    const userMessages = messages.filter((m) => m.role === "user").slice(0, 3);
    if (userMessages.length > 0) {
      summary = userMessages.map((m) => m.content).join(" | ").substring(0, 100);
      if (summary.length === 100) summary += "...";
    }

    const chat: Chat = {
      id: finalChatId,
      title,
      summary,
      lastMessage,
      timestamp: Date.now(),
      aiModel,
      messageCount: messages.length,
      messages: messages, // Save full messages
    };

    if (existingChat) {
      // Update existing chat
      const updated = chats.map((c) => (c.id === finalChatId ? chat : c));
      localStorage.setItem("ai-chat-history", JSON.stringify(updated));
    } else {
      // Add new chat
      chats.unshift(chat);
      // Keep only last 50 chats
      const limited = chats.slice(0, 50);
      localStorage.setItem("ai-chat-history", JSON.stringify(limited));
    }
    
    // Return the chatId that was actually used (might be different if we continued an existing chat)
    return finalChatId;
  } catch (error) {
    console.error("Failed to save chat:", error);
    return chatId;
  }
}

export function getChats(): Chat[] {
  try {
    const stored = localStorage.getItem("ai-chat-history");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load chats:", error);
  }
  return [];
}

// Load full messages for a specific chat
export function getChatMessages(chatId: string): any[] | null {
  try {
    const chats = getChats();
    const chat = chats.find((c) => c.id === chatId);
    return chat?.messages || null;
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    return null;
  }
}

export function deleteChat(chatId: string) {
  try {
    const chats = getChats();
    const filtered = chats.filter((c) => c.id !== chatId);
    localStorage.setItem("ai-chat-history", JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete chat:", error);
  }
}

export function clearAllChats() {
  try {
    localStorage.removeItem("ai-chat-history");
  } catch (error) {
    console.error("Failed to clear chats:", error);
  }
}
