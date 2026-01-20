import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// Check rate limits for a user
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json();

    // Get rate limit settings
    const { data: settings } = await adminClient
      .from('creator_settings')
      .select('setting_value')
      .eq('setting_key', 'rate_limit')
      .single();

    const rateLimits = settings?.setting_value || {
      enabled: false,
      messagesPerMinute: 10,
      cooldownSeconds: 0,
      dailyCap: 100,
    };

    if (!rateLimits.enabled) {
      return NextResponse.json({ allowed: true });
    }

    // Get user
    const userQuery = userId 
      ? adminClient.from('users').select('*').eq('id', userId).single()
      : adminClient.from('users').select('*').eq('session_id', sessionId).single();
    
    const { data: user } = await userQuery;
    if (!user) {
      return NextResponse.json({ allowed: true }); // New user, allow
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Check messages per minute
    const { count: recentMessages } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'message_sent')
      .gte('created_at', oneMinuteAgo.toISOString());

    if (recentMessages && recentMessages >= rateLimits.messagesPerMinute) {
      return NextResponse.json(
        { allowed: false, reason: 'Rate limit exceeded: too many messages per minute' },
        { status: 429 }
      );
    }

    // Check daily cap
    const { count: todayMessages } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'message_sent')
      .gte('created_at', todayStart.toISOString());

    if (todayMessages && todayMessages >= rateLimits.dailyCap) {
      return NextResponse.json(
        { allowed: false, reason: 'Daily usage cap reached' },
        { status: 429 }
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error: any) {
    console.error('Error checking rate limits:', error);
    // On error, allow the request (fail open)
    return NextResponse.json({ allowed: true });
  }
}
