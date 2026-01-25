import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - Get current user's incognito unlock status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", unlocked: false },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", unlocked: false },
        { status: 401 }
      );
    }

    const { data: dbUser, error: dbError } = await adminClient
      .from('users')
      .select('incognito_unlocked')
      .eq('auth_user_id', user.id)
      .single();

    if (dbError || !dbUser) {
      return NextResponse.json({ unlocked: false });
    }

    return NextResponse.json({
      unlocked: !!dbUser.incognito_unlocked,
    });
  } catch (error: any) {
    console.error('Error fetching incognito status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status', unlocked: false },
      { status: 500 }
    );
  }
}

// POST - Unlock incognito mode for current user
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (code?.toLowerCase().trim() !== "incog25") {
      return NextResponse.json(
        { error: "Incorrect code" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    let { data: dbUser, error: findError } = await adminClient
      .from('users')
      .select('id, incognito_unlocked')
      .eq('auth_user_id', user.id)
      .single();

    if (findError || !dbUser) {
      const { data: newUser, error: createError } = await adminClient
        .from('users')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          incognito_unlocked: true,
        })
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error("Failed to create user record");
      }

      return NextResponse.json({
        success: true,
        unlocked: true,
        message: "Incognito mode unlocked!",
      });
    }

    const { error: updateError } = await adminClient
      .from('users')
      .update({ incognito_unlocked: true })
      .eq('id', dbUser.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      unlocked: true,
      message: dbUser.incognito_unlocked
        ? "Incognito mode already unlocked!"
        : "Incognito mode unlocked!",
    });
  } catch (error: any) {
    console.error('Error unlocking incognito:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlock incognito mode' },
      { status: 500 }
    );
  }
}
