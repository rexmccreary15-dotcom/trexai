import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createSupabaseAdmin();
    console.log('=== ANALYTICS API START ===');
    
    // First, check if we have ANY analytics events at all
    const { data: allEvents, count: allEventsCount, error: allEventsError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('All analytics events check:', { 
      sampleCount: allEvents?.length || 0, 
      totalCount: allEventsCount, 
      error: allEventsError?.message,
      sampleEvents: allEvents?.slice(0, 3) 
    });
    
    // Get total messages count
    const { count: totalMessages, error: messagesError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'message_sent');
    
    console.log('Total messages query:', { count: totalMessages, error: messagesError?.message });

    // Get active users (users active in last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { count: activeUsers, error: activeUsersError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', twentyFourHoursAgo.toISOString())
      .eq('is_banned', false);
    
    console.log('Active users query:', { count: activeUsers, error: activeUsersError?.message });

    // Get peak usage time (hour with most messages)
    const { data: hourlyData, error: hourlyError } = await adminClient
      .from('analytics_events')
      .select('created_at')
      .eq('event_type', 'message_sent');
    
    console.log('Hourly data query:', { count: hourlyData?.length || 0, error: hourlyError?.message });

    const hourlyCounts: { [key: number]: number } = {};
    hourlyData?.forEach((event) => {
      const hour = new Date(event.created_at).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    let peakHour: number | null = null;
    let maxCount = 0;
    Object.entries(hourlyCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    // Only show peak time if we actually have data
    const peakUsageTime = peakHour === null || maxCount === 0 ? 'N/A' : 
      peakHour === 0 ? '12:00 AM' : 
      peakHour < 12 ? `${peakHour}:00 AM` : 
      peakHour === 12 ? '12:00 PM' : 
      `${peakHour - 12}:00 PM`;

    console.log('Peak usage calculation:', { peakHour, maxCount, peakUsageTime });

    // Get popular AI models
    const { data: modelData, error: modelError } = await adminClient
      .from('analytics_events')
      .select('ai_model')
      .eq('event_type', 'message_sent')
      .not('ai_model', 'is', null);
    
    console.log('Model data query:', { count: modelData?.length || 0, error: modelError?.message });

    const modelCounts: { [key: string]: number } = {};
    modelData?.forEach((event) => {
      const model = event.ai_model || 'unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    const popularModels = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }));

    console.log('Popular models:', popularModels);

    // Get total users
    const { count: totalUsers, error: totalUsersError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', false);
    
    console.log('Total users query:', { count: totalUsers, error: totalUsersError?.message });

    // Get messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: messagesToday, error: todayError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'message_sent')
      .gte('created_at', today.toISOString());
    
    console.log('Messages today query:', { count: messagesToday, error: todayError?.message });

    const result = {
      totalMessages: totalMessages ?? 0,
      activeUsers: activeUsers ?? 0,
      totalUsers: totalUsers ?? 0,
      messagesToday: messagesToday ?? 0,
      peakUsageTime: peakUsageTime,
      popularModels: popularModels || [],
    };
    
    console.log('=== ANALYTICS API RESULT ===', result);
    console.log('=== ANALYTICS API END ===');

    return NextResponse.json(result);
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
