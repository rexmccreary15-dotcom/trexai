import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await adminClient
      .from('users')
      .select('*', { count: 'exact' })
      .order('last_active', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Recalculate message counts and fetch emails from auth
    const usersWithCorrectCounts = await Promise.all((users || []).map(async (user) => {
      const { count: actualMessageCount } = await adminClient
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('event_type', 'message_sent');

      const realCount = actualMessageCount || 0;
      const storedCount = user.message_count || 0;

      // Update in database if different
      if (realCount !== storedCount && realCount > 0) {
        await adminClient
          .from('users')
          .update({ message_count: realCount })
          .eq('id', user.id);
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
              .eq('id', user.id);
          }
        } catch (err) {
          console.error('Error fetching email from auth for user:', user.id, err);
        }
      }

      return {
        ...user,
        email: userEmail || user.email || null,
        message_count: realCount, // Always return the actual count
      };
    }));

    return NextResponse.json({
      users: usersWithCorrectCounts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', users: [], total: 0 },
      { status: 500 }
    );
  }
}
