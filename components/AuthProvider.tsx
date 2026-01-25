"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type User = { id: string; email?: string } | null;

const AuthContext = createContext<{ user: User; loading: boolean }>({ user: null, loading: true });

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

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
      } finally {
        setLoading(false);
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
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
