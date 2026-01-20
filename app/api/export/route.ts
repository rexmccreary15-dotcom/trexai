import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - Export all data
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type") || "all";

    if (type === "chats") {
      // Export all chats
      const { data: chats } = await adminClient
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: messages } = await adminClient
        .from('messages')
        .select('*')
        .order('sequence_number', { ascending: true });

      // Combine chats with their messages
      const chatsWithMessages = (chats || []).map((chat) => ({
        ...chat,
        messages: (messages || []).filter((msg) => msg.chat_id === chat.id),
      }));

      return NextResponse.json({
        type: "chats",
        exportedAt: new Date().toISOString(),
        count: chatsWithMessages.length,
        data: chatsWithMessages,
      });
    } else if (type === "settings") {
      // Export all settings
      const { data: settings } = await adminClient
        .from('creator_settings')
        .select('*');

      return NextResponse.json({
        type: "settings",
        exportedAt: new Date().toISOString(),
        count: settings?.length || 0,
        data: settings || [],
      });
    } else {
      // Export everything
      const { data: users } = await adminClient.from('users').select('*');
      const { data: chats } = await adminClient.from('chats').select('*');
      const { data: messages } = await adminClient.from('messages').select('*');
      const { data: settings } = await adminClient.from('creator_settings').select('*');
      const { data: analytics } = await adminClient
        .from('analytics_events')
        .select('*')
        .limit(10000); // Limit to prevent huge exports

      return NextResponse.json({
        type: "all",
        exportedAt: new Date().toISOString(),
        users: users || [],
        chats: chats || [],
        messages: messages || [],
        settings: settings || [],
        analytics: analytics || [],
      });
    }
  } catch (error: any) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
