import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/db/chatStorage";
import { createSupabaseAdmin } from "@/lib/supabase";

// POST - Heartbeat when app is open. Updates last_heartbeat for presence.
// "Active" = last_heartbeat within HEARTBEAT_ONLINE_SEC.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId as string | undefined;
    const authUserId = body.authUserId as string | undefined;
    const authUserEmail = body.authUserEmail as string | undefined;

    if (!sessionId && !authUserId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId or authUserId" }, { status: 400 });
    }

    const userId = await getOrCreateUser(sessionId || "", authUserId, authUserEmail);
    if (!userId) return NextResponse.json({ ok: false }, { status: 400 });

    const admin = createSupabaseAdmin();
    await admin
      .from("users")
      .update({ last_heartbeat: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Heartbeat error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
