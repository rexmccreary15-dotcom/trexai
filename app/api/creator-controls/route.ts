import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - Get current user's creator controls unlock status
export async function GET(request: NextRequest) {
  try {
    // Get the auth token from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", unlocked: false },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Use admin client to verify the token
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", unlocked: false },
        { status: 401 }
      );
    }

    // Find the user in our users table by auth_user_id
    const { data: dbUser, error: dbError } = await adminClient
      .from('users')
      .select('creator_controls_unlocked')
      .eq('auth_user_id', user.id)
      .single();

    if (dbError || !dbUser) {
      // User might not exist in our users table yet, return false
      return NextResponse.json({ unlocked: false });
    }

    return NextResponse.json({ 
      unlocked: dbUser.creator_controls_unlocked || false 
    });
  } catch (error: any) {
    console.error('Error fetching creator controls status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status', unlocked: false },
      { status: 500 }
    );
  }
}

// POST - Unlock creator controls for current user
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Verify the code
    if (code?.toLowerCase().trim() !== "maker15") {
      return NextResponse.json(
        { error: "Incorrect code" },
        { status: 400 }
      );
    }

    // Get the auth token from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Use admin client to verify the token
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    // Find or create the user in our users table
    let { data: dbUser, error: findError } = await adminClient
      .from('users')
      .select('id, creator_controls_unlocked')
      .eq('auth_user_id', user.id)
      .single();

    if (findError || !dbUser) {
      // User doesn't exist in our users table, create them
      const { data: newUser, error: createError } = await adminClient
        .from('users')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          creator_controls_unlocked: true,
        })
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error("Failed to create user record");
      }

      return NextResponse.json({ 
        success: true, 
        unlocked: true,
        message: "Creator Controls unlocked!" 
      });
    }

    // Update existing user
    const { error: updateError } = await adminClient
      .from('users')
      .update({ creator_controls_unlocked: true })
      .eq('id', dbUser.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      unlocked: true,
      message: dbUser.creator_controls_unlocked 
        ? "Creator Controls already unlocked!" 
        : "Creator Controls unlocked!" 
    });
  } catch (error: any) {
    console.error('Error unlocking creator controls:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlock creator controls' },
      { status: 500 }
    );
  }
}
