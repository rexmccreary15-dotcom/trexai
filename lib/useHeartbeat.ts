"use client";

import { useEffect, useRef } from "react";
import { getSessionId } from "@/lib/db/chatStorage";
import { getSupabaseClient } from "@/lib/supabase";

const HEARTBEAT_INTERVAL_MS = 25_000;

export function useHeartbeat() {
  const sentRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const tick = async () => {
      try {
        const sessionId = getSessionId();
        let authUserId: string | null = null;
        let authUserEmail: string | null = null;
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            authUserId = session.user.id;
            authUserEmail = session.user.email ?? null;
          }
        }
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || undefined,
            authUserId: authUserId ?? undefined,
            authUserEmail: authUserEmail ?? undefined,
          }),
        });
        sentRef.current = true;
      } catch {
        // ignore
      }
    };

    tick();
    const id = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
