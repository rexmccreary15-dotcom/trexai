"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Trash2, MessageSquare, LogIn, X } from "lucide-react";
import { getChats, deleteChat, type Chat } from "@/lib/chatStorage";
import { formatDistanceToNow } from "date-fns";
import AuthModal from "@/components/AuthModal";
import { getSupabaseClient } from "@/lib/supabase";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const supabase = getSupabaseClient();

  // Check if this is first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("has-visited-before");
    if (!hasVisitedBefore) {
      setShowFirstTimeModal(true);
    }
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

  // Auth: getSession() for initial state. Only clear chats + set null on explicit SIGNED_OUT.
  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      try {
        let session = (await supabase.auth.getSession()).data?.session;
        // Retry briefly in case storage isn't ready yet (e.g. right after client-side nav)
        if (!session && typeof window !== "undefined") {
          await new Promise((r) => setTimeout(r, 50));
          session = (await supabase.auth.getSession()).data?.session;
        }
        const u = session?.user ?? null;
        setUser(u);
        if (!u) {
          localStorage.removeItem("ai-chat-history");
          setChats([]);
        }
      } catch (e) {
        console.error("Auth init error:", e);
        setUser(null);
        setChats([]);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("ai-chat-history");
        setChats([]);
        return;
      }
      // Never overwrite user with null except on SIGNED_OUT (avoids spurious null events on nav/token refresh)
      if (session?.user) setUser(session.user);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  
  // Load chats when user changes
  useEffect(() => {
    loadChats();
  }, [loadChats]);

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
        // ignore
      }
      return;
    }
    deleteChat(chatId);
    setChats(getChats());
  };


  const handleStartNewChat = () => {
    // Check if first visit and user hasn't logged in
    const hasVisitedBefore = localStorage.getItem("has-visited-before");
    if (!hasVisitedBefore && !user) {
      setShowFirstTimeModal(true);
      return;
    }
    // Mark as visited
    localStorage.setItem("has-visited-before", "true");
    // Navigate to chat
    window.location.href = `/chat?new=${Date.now()}`;
  };

  const handleSkipLogin = () => {
    localStorage.setItem("has-visited-before", "true");
    setShowFirstTimeModal(false);
  };

  const handleAuthSuccess = () => {
    localStorage.setItem("has-visited-before", "true");
    setShowFirstTimeModal(false);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Log In Button - Top Left */}
      <div className="absolute top-4 left-4">
        {!user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogIn size={18} />
            Log In
          </button>
        )}
        {user && (
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={() => {
                // Sign out immediately without waiting
                if (supabase) {
                  supabase.auth.signOut().then(() => {
                    setUser(null);
                    // Reload page to clear all state
                    window.location.reload();
                  });
                }
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center">
            TREXAI
          </h1>
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
                    <div className="flex items-center gap-2">
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
            <button
              onClick={handleStartNewChat}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>

      {/* First Time Login Modal */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        theme={theme}
      />
    </main>
  );
}
