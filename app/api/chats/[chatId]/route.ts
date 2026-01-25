import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// DELETE - Remove a chat (must belong to the authenticated user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat id" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createSupabaseAdmin();
    const { data: { user: authUser }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dbUser } = await adminClient
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: chat } = await adminClient
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", dbUser.id)
      .maybeSingle();

    if (!chat) {
      return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
    }

    await adminClient.from("messages").delete().eq("chat_id", chatId);
    const { error: delError } = await adminClient
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", dbUser.id);

    if (delError) {
      console.error("Error deleting chat:", delError);
      return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/chats/[chatId] error:", e);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
