import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// Disable caching for analytics - always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    console.log('Total messages query:', { 
      count: totalMessages, 
      error: messagesError?.message,
      timestamp: new Date().toISOString()
    });

    // Active users = actually using right now (last 15 minutes), not "visited in last 24h"
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
    
    const { data: allUsersSample, count: totalUsersCount, error: allUsersError } = await adminClient
      .from('users')
      .select('id, last_active, is_banned', { count: 'exact' })
      .or('auth_user_id.not.is.null,display_name.not.is.null')
      .limit(10);
    
    console.log('All users sample:', { 
      count: totalUsersCount, 
      error: allUsersError?.message,
      sample: allUsersSample?.slice(0, 3).map(u => ({ 
        id: u.id, 
        last_active: u.last_active, 
        is_banned: u.is_banned 
      }))
    });
    
    const { count: activeUsers, error: activeUsersError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', fifteenMinutesAgo.toISOString())
      .eq('is_banned', false)
      .or('auth_user_id.not.is.null,display_name.not.is.null');
    
    console.log('Active users query (last 15 min):', { 
      count: activeUsers, 
      error: activeUsersError?.message,
      fifteenMinutesAgo: fifteenMinutesAgo.toISOString()
    });

    // Get peak usage time (hour with most messages)
    // Database stores times in UTC, but we'll calculate in both UTC and convert to US timezones
    const { data: hourlyData, error: hourlyError } = await adminClient
      .from('analytics_events')
      .select('created_at')
      .eq('event_type', 'message_sent');
    
    console.log('Hourly data query:', { count: hourlyData?.length || 0, error: hourlyError?.message });

    // Count by UTC hour and by US Mountain Time (Colorado) hour
    const utcHourlyCounts: { [key: number]: number } = {};
    const mstHourlyCounts: { [key: number]: number } = {}; // Mountain Standard Time
    
    hourlyData?.forEach((event) => {
      const eventDate = new Date(event.created_at);
      
      // Get UTC hour
      const utcHour = eventDate.getUTCHours();
      utcHourlyCounts[utcHour] = (utcHourlyCounts[utcHour] || 0) + 1;
      
      // Convert to Mountain Time (UTC-6 or UTC-7 depending on DST)
      // For simplicity, we'll use a fixed offset. In production, use a timezone library.
      // Colorado is UTC-7 in winter (MST) and UTC-6 in summer (MDT)
      // Estimate: assume UTC-7 for now (can be improved with timezone library)
      let mstHour = utcHour - 7;
      if (mstHour < 0) mstHour += 24;
      mstHourlyCounts[mstHour] = (mstHourlyCounts[mstHour] || 0) + 1;
    });

    // Find peak hour in Mountain Time (since user is in Colorado)
    let peakHour: number | null = null;
    let maxCount = 0;
    Object.entries(mstHourlyCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    // Format peak time
    let peakUsageTime = 'N/A';
    if (peakHour !== null && maxCount > 0) {
      if (peakHour === 0) {
        peakUsageTime = '12:00 AM (MT)';
      } else if (peakHour < 12) {
        peakUsageTime = `${peakHour}:00 AM (MT)`;
      } else if (peakHour === 12) {
        peakUsageTime = '12:00 PM (MT)';
      } else {
        peakUsageTime = `${peakHour - 12}:00 PM (MT)`;
      }
    }

    console.log('Peak usage calculation:', { 
      peakHour, 
      maxCount, 
      peakUsageTime,
      utcHourlyCounts,
      mstHourlyCounts
    });

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

    // Total users (signed-in or have a name; exclude anonymous no-name sessions)
    const { count: totalUsers, error: totalUsersError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', false)
      .or('auth_user_id.not.is.null,display_name.not.is.null');
    
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

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
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
