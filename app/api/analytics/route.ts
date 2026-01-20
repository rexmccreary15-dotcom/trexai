import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createSupabaseAdmin();
    // Get total messages count
    const { count: totalMessages } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'message_sent');

    // Get active users (users active in last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { count: activeUsers } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', twentyFourHoursAgo.toISOString())
      .eq('is_banned', false);

    // Get peak usage time (hour with most messages)
    const { data: hourlyData } = await adminClient
      .from('analytics_events')
      .select('created_at')
      .eq('event_type', 'message_sent');

    const hourlyCounts: { [key: number]: number } = {};
    hourlyData?.forEach((event) => {
      const hour = new Date(event.created_at).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    let peakHour = 0;
    let maxCount = 0;
    Object.entries(hourlyCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    const peakUsageTime = peakHour === 0 ? '12:00 AM' : 
      peakHour < 12 ? `${peakHour}:00 AM` : 
      peakHour === 12 ? '12:00 PM' : 
      `${peakHour - 12}:00 PM`;

    // Get popular AI models
    const { data: modelData } = await adminClient
      .from('analytics_events')
      .select('ai_model')
      .eq('event_type', 'message_sent')
      .not('ai_model', 'is', null);

    const modelCounts: { [key: string]: number } = {};
    modelData?.forEach((event) => {
      const model = event.ai_model || 'unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    const popularModels = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }));

    // Get total users
    const { count: totalUsers } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', false);

    // Get messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: messagesToday } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'message_sent')
      .gte('created_at', today.toISOString());

    return NextResponse.json({
      totalMessages: totalMessages || 0,
      activeUsers: activeUsers || 0,
      totalUsers: totalUsers || 0,
      messagesToday: messagesToday || 0,
      peakUsageTime: peakUsageTime || 'N/A',
      popularModels: popularModels || [],
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        errorMessage: error?.message || 'Unknown error',
        totalMessages: 0,
        activeUsers: 0,
        totalUsers: 0,
        messagesToday: 0,
        peakUsageTime: 'N/A',
        popularModels: [],
      },
      { status: 500 }
    );
  }
}
