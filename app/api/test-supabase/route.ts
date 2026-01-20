import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const urlPreview = process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...';
    const anonKeyPreview = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...';
    const serviceKeyPreview = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...';
    
    // Try to create client
    let clientCreated = false;
    let testQuery = null;
    let errorMessage = null;
    
    try {
      const adminClient = createSupabaseAdmin();
      clientCreated = true;
      
      // Try a simple query
      const { data, error } = await adminClient
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        errorMessage = error.message;
        testQuery = { error: error.message, code: error.code };
      } else {
        testQuery = { success: true, count: data };
      }
    } catch (err: any) {
      errorMessage = err.message;
      clientCreated = false;
    }
    
    return NextResponse.json({
      envVars: {
        hasUrl,
        hasAnonKey,
        hasServiceKey,
        urlPreview,
        anonKeyPreview,
        serviceKeyPreview,
      },
      clientCreated,
      testQuery,
      errorMessage,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
