import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// GET - Fetch commands for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createSupabaseAdmin();
    const { data: { user: authUser }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dbUser, error: userError } = await adminClient
      .from("users")
      .select("id, commands")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (userError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const commands = Array.isArray(dbUser.commands) ? dbUser.commands : [];
    return NextResponse.json({ commands });
  } catch (e: any) {
    console.error("GET /api/user/commands error:", e);
    return NextResponse.json({ error: "Failed to load commands" }, { status: 500 });
  }
}

// PUT - Save commands for the authenticated user
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createSupabaseAdmin();
    const { data: { user: authUser }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const commands = Array.isArray(body.commands) ? body.commands : [];

    const { data: dbUser, error: findError } = await adminClient
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (findError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error: updateError } = await adminClient
      .from("users")
      .update({ commands })
      .eq("id", dbUser.id);

    if (updateError) {
      console.error("Error saving commands:", updateError);
      return NextResponse.json({ error: "Failed to save commands" }, { status: 500 });
    }

    return NextResponse.json({ commands });
  } catch (e: any) {
    console.error("PUT /api/user/commands error:", e);
    return NextResponse.json({ error: "Failed to save commands" }, { status: 500 });
  }
}
