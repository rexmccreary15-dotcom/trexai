import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createSupabaseAdmin();
    
    // Test 1: Count users
    const { count: userCount, error: userError } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Test 2: Count analytics events
    const { count: eventCount, error: eventError } = await adminClient
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });
    
    // Test 3: Try to insert a test event
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    const { data: insertData, error: insertError } = await adminClient
      .from('analytics_events')
      .insert({
        user_id: testUserId,
        event_type: 'test',
        ai_model: 'test',
        metadata: { test: true },
      })
      .select();
    
    // Clean up test insert
    if (insertData) {
      await adminClient
        .from('analytics_events')
        .delete()
        .eq('id', insertData[0].id);
    }
    
    return NextResponse.json({
      success: true,
      users: {
        count: userCount || 0,
        error: userError?.message,
      },
      analyticsEvents: {
        count: eventCount || 0,
        error: eventError?.message,
      },
      insertTest: {
        success: !!insertData,
        error: insertError?.message,
        errorCode: insertError?.code,
        errorDetails: insertError?.details,
      },
      envVars: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
