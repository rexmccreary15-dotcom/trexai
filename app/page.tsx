"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import { getChats, deleteChat, type Chat } from "@/lib/chatStorage";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        // Try to load from database first
        const dbChats = await getChatsFromDB();
        if (dbChats && dbChats.length > 0) {
          setChats(dbChats);
        } else {
          // Fallback to localStorage
          setChats(getChats());
        }
      } catch (error) {
        console.error('Error loading chats, using localStorage:', error);
        // Fallback to localStorage
        setChats(getChats());
      }
    };
    
    loadChats();
  }, []);

  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat(chatId);
    setChats(getChats());
  };

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case "openai":
        return "bg-green-600";
      case "gemini":
        return "bg-blue-600";
      case "claude":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center">
            TREXAI
          </h1>
          <p className="text-xl text-gray-300 text-center mb-12">
            Chat with multiple AI providers - ChatGPT, Gemini, and Claude
          </p>

          {chats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat?chatId=${chat.id}`}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition group relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold pr-8">{chat.title}</h3>
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-600 rounded"
                      title="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {chat.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded ${getModelBadgeColor(chat.aiModel)} text-white`}>
                        {chat.aiModel === "openai" ? "ChatGPT" : chat.aiModel === "gemini" ? "Gemini" : "Claude"}
                      </span>
                      <span className="text-gray-500">
                        {chat.messageCount} messages
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 mb-12">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">No chat history yet</p>
              <p className="text-gray-500 text-sm">Start a new conversation to see it here</p>
            </div>
          )}

          <div className="text-center">
            <Link
              href={`/chat?new=${Date.now()}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Start New Chat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
