import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - Get specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

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

    // Get user's chats
    const { data: chats } = await adminClient
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);

    // Recalculate actual message count from analytics events (more accurate)
    const { count: actualMessageCount, error: countError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_type', 'message_sent');

    if (countError) {
      console.error('Error counting messages:', countError);
    }

    // Update the user's message_count in the database if it's different
    const storedCount = user.message_count || 0;
    const realCount = actualMessageCount || 0;
    
    if (realCount !== storedCount && realCount > 0) {
      console.log(`Updating user ${userId} message_count: ${storedCount} -> ${realCount}`);
      await adminClient
        .from('users')
        .update({ message_count: realCount })
        .eq('id', userId);
      user.message_count = realCount;
    }

    return NextResponse.json({
      ...user,
      message_count: realCount, // Always return the actual count
      chats: chats || [],
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
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
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
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

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
