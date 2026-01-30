import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const admin = createSupabaseAdmin();

// POST - Check if current user/session is banned. Client sends sessionId and/or accessToken.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId as string | undefined;
    const accessToken = body.accessToken as string | undefined;

    if (!sessionId && !accessToken) {
      return NextResponse.json({ banned: false });
    }

    let userId: string | null = null;

    if (accessToken) {
      const { data: { user: authUser }, error } = await admin.auth.getUser(accessToken);
      if (!error && authUser?.id) {
        const { data: dbUser } = await admin
          .from("users")
          .select("id")
          .eq("auth_user_id", authUser.id)
          .maybeSingle();
        if (dbUser) userId = dbUser.id;
      }
    }

    if (!userId && sessionId) {
      const { data: dbUser } = await admin
        .from("users")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (dbUser) userId = dbUser.id;
    }

    if (!userId) {
      return NextResponse.json({ banned: false });
    }

    const { data: user, error } = await admin
      .from("users")
      .select("id, is_banned, ban_reason")
      .eq("id", userId)
      .single();

    if (error || !user || !user.is_banned) {
      return NextResponse.json({ banned: false });
    }

    return NextResponse.json({
      banned: true,
      reason: user.ban_reason ?? "You have been banned from this site.",
    });
  } catch (e) {
    console.error("check-ban error:", e);
    return NextResponse.json({ banned: false });
  }
}

// GET - Same check, for backwards compatibility. Identity must come from cookies or we return not banned.
export async function GET() {
  return NextResponse.json({ banned: false });
}
