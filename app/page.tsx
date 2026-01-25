"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Trash2, MessageSquare, LogIn, X } from "lucide-react";
import { getChats, deleteChat, type Chat } from "@/lib/chatStorage";
import { formatDistanceToNow } from "date-fns";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const supabase = getSupabaseClient();

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("has-visited-before");
    if (!hasVisitedBefore) setShowFirstTimeModal(true);
  }, []);

  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      return;
    }
    if (!supabase) return;
    let session = (await supabase.auth.getSession()).data?.session;
    if (!session?.access_token) {
      await new Promise((r) => setTimeout(r, 80));
      session = (await supabase.auth.getSession()).data?.session;
    }
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/chats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.chats)) setChats(data.chats);
    } catch (e) {
      console.error("Error loading chats:", e);
    }
  }, [user, supabase]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const t = localStorage.getItem("theme") as "dark" | "light" | null;
    if (t) setTheme(t);
  }, []);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        setChats((prev) => prev.filter((c) => c.id !== chatId));
      } catch {
        /* ignore */
      }
      return;
    }
    deleteChat(chatId);
    setChats(getChats());
  };

  const handleStartNewChat = () => {
    const hasVisitedBefore = localStorage.getItem("has-visited-before");
    if (!hasVisitedBefore && !user) {
      setShowFirstTimeModal(true);
      return;
    }
    localStorage.setItem("has-visited-before", "true");
    router.push(`/chat?new=${Date.now()}`);
  };

  const handleSkipLogin = () => {
    localStorage.setItem("has-visited-before", "true");
    setShowFirstTimeModal(false);
  };

  const handleAuthSuccess = () => {
    localStorage.setItem("has-visited-before", "true");
    setShowFirstTimeModal(false);
  };

  const handleSignOut = () => {
    if (!supabase) return;
    supabase.auth.signOut().then(() => {
      localStorage.removeItem("ai-chat-history");
      setChats([]);
      window.location.reload();
    });
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="absolute top-4 left-4">
        {!loading && !user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogIn size={18} />
            Log In
          </button>
        )}
        {!loading && user && (
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center">TREXAI</h1>
          <p className="text-xl text-gray-300 text-center mb-12">
            Chat with multiple AI providers
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
                    <span className="text-gray-500">{chat.messageCount} messages</span>
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
            <button
              onClick={handleStartNewChat}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>

      {showFirstTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg w-full max-w-md m-4 border border-gray-700">
            <div className="border-b border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Welcome to TREXAI</h2>
              <button
                onClick={handleSkipLogin}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Create an account to save your chat history and access it from any device.
              </p>
              <p className="text-sm text-gray-400">
                You can skip this and use the site anonymously, but your chats won&apos;t be saved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFirstTimeModal(false);
                    setShowAuthModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Create Account / Log In
                </button>
                <button
                  onClick={handleSkipLogin}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        theme={theme}
      />
    </main>
  );
}
