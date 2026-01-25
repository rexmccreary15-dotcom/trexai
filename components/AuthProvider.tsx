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

    // Set loading false immediately so UI can render
    setLoading(false);

    const init = async () => {
      try {
        let session = (await supabase.auth.getSession()).data?.session;
        if (!session && typeof window !== "undefined") {
          await new Promise((r) => setTimeout(r, 50));
          session = (await supabase.auth.getSession()).data?.session;
        }
        const u = session?.user ?? null;
        setUser(u);
        // Do NOT clear localStorage here—only on SIGNED_OUT. Avoids wiping due to slow/racy init.
      } catch (e) {
        console.error("Auth init error:", e);
        setUser(null);
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
