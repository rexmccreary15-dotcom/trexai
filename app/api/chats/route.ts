import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getChatsFromDB } from "@/lib/db/chatStorage";

// GET - List chats for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized", chats: [] }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createSupabaseAdmin();
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", chats: [] }, { status: 401 });
    }

    const chats = await getChatsFromDB(user.id);
    return NextResponse.json({ chats: chats || [] });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats", chats: [] },
      { status: 500 }
    );
  }
}
