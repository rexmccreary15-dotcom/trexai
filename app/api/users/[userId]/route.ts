import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { getChatMessagesFromDB } from "@/lib/db/chatStorage";

const adminClient = createSupabaseAdmin();

// GET - Get specific user details including chats with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { data: user, error } = await adminClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Always try to get email from Supabase Auth when we have auth_user_id
    let userEmail = user.email;
    if (user.auth_user_id) {
      try {
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(user.auth_user_id);
        if (!authError && authUser?.user?.email) {
          userEmail = authUser.user.email;
          await adminClient
            .from('users')
            .update({ email: userEmail })
            .eq('id', userId);
        }
      } catch (err) {
        console.error('Error fetching email from auth:', err);
      }
    }

    const { data: chats } = await adminClient
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);

    const chatsWithMessages = await Promise.all((chats || []).map(async (chat) => {
      const messages = await getChatMessagesFromDB(chat.id);
      return { ...chat, messages: messages || [] };
    }));

    const { count: actualMessageCount, error: countError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_type', 'message_sent');

    if (countError) {
      console.error('Error counting messages:', countError);
    }

    const storedCount = user.message_count || 0;
    const realCount = actualMessageCount || 0;
    if (realCount !== storedCount && realCount > 0) {
      await adminClient
        .from('users')
        .update({ message_count: realCount })
        .eq('id', userId);
    }

    return NextResponse.json({
      ...user,
      display_name: user.display_name ?? null,
      email: userEmail || user.email || null,
      message_count: realCount,
      chats: chatsWithMessages,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (ban, set limits, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    const updateData: any = {};
    
    if (body.is_banned !== undefined) {
      updateData.is_banned = body.is_banned;
    }
    if (body.ban_reason !== undefined) {
      updateData.ban_reason = body.ban_reason;
    }
    if (body.usage_limit_daily !== undefined) {
      updateData.usage_limit_daily = body.usage_limit_daily;
    }
    if (body.usage_limit_hourly !== undefined) {
      updateData.usage_limit_hourly = body.usage_limit_hourly;
    }

    const { data: updatedUser, error } = await adminClient
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user and their data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Delete user (cascade will delete chats and messages)
    const { error } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
