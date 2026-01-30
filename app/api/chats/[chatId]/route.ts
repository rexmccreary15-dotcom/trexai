import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getChatMessagesFromDB } from "@/lib/db/chatStorage";

// GET - Fetch a single chat's messages (must belong to the authenticated user)
export async function GET(
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
      .select("id, ai_model")
      .eq("id", chatId)
      .eq("user_id", dbUser.id)
      .maybeSingle();

    if (!chat) {
      return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
    }

    const messages = await getChatMessagesFromDB(chatId);
    return NextResponse.json({
      messages: messages || [],
      aiModel: chat.ai_model || "myai",
    });
  } catch (e: any) {
    console.error("GET /api/chats/[chatId] error:", e);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

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

    // Soft-delete only: user no longer sees it on home, but creator still sees full history (including deleted).
    const { error: delError } = await adminClient
      .from("chats")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("user_id", dbUser.id);

    if (delError) {
      console.error("Error soft-deleting chat (run add_creator_chat_features.sql to add deleted_at column):", delError);
      return NextResponse.json({ error: "Failed to delete chat. Add deleted_at column in Supabase." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/chats/[chatId] error:", e);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
