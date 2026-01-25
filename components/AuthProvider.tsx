"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type User = { id: string; email?: string } | null;

const AuthContext = createContext<{ user: User }>({ user: null });

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      try {
        let session = (await supabase.auth.getSession()).data?.session;
        if (!session && typeof window !== "undefined") {
          await new Promise((r) => setTimeout(r, 80));
          session = (await supabase.auth.getSession()).data?.session;
        }
        const u = session?.user ?? null;
        setUser(u);
        if (!u) {
          localStorage.removeItem("ai-chat-history");
        }
      } catch (e) {
        console.error("Auth init error:", e);
        setUser(null);
        localStorage.removeItem("ai-chat-history");
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("ai-chat-history");
        return;
      }
      if (session?.user) setUser(session.user);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
