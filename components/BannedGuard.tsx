"use client";

import { useCallback, useEffect, useState } from "react";
import { getSessionId } from "@/lib/db/chatStorage";
import { getSupabaseClient } from "@/lib/supabase";

type BannedState = "loading" | "allowed" | "banned";

export function BannedGuard({ children }: { children: React.ReactNode }) {
  const [banned, setBanned] = useState<BannedState>("loading");
  const [reason, setReason] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const sessionId = typeof window !== "undefined" ? getSessionId() : "";
      const supabase = getSupabaseClient();
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const accessToken = session?.access_token ?? undefined;
      const res = await fetch("/api/check-ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId || undefined, accessToken }),
      });
      const data = await res.json();
      if (data?.banned) {
        setBanned("banned");
        setReason(data.reason ?? "You have been banned from this site.");
      } else {
        setBanned("allowed");
        setReason(null);
      }
    } catch {
      setBanned("allowed");
      setReason(null);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (banned === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-200">
        <div className="animate-pulse">Checking access…</div>
      </div>
    );
  }

  if (banned === "banned") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-neutral-200 px-4">
        <h1 className="text-xl font-semibold text-red-400">Access denied</h1>
        <p className="mt-2 max-w-md text-center text-neutral-400">{reason}</p>
        <p className="mt-4 text-sm text-neutral-500">
          You cannot use this site. If you believe this is an error, contact the site owner.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
