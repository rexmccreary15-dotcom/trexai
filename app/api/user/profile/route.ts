import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

// GET - Fetch profile (display_name, api_keys, default_ai) for the authenticated user
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
      .select("display_name, api_keys, default_ai")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (userError || !dbUser) {
      return NextResponse.json({ display_name: null, api_keys: {}, default_ai: "myai" });
    }

    return NextResponse.json({
      display_name: dbUser.display_name ?? null,
      api_keys: dbUser.api_keys && typeof dbUser.api_keys === "object" ? dbUser.api_keys : {},
      default_ai: dbUser.default_ai ?? "myai",
    });
  } catch (e: any) {
    console.error("GET /api/user/profile error:", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// PUT - Save profile (display_name, api_keys, default_ai) for the authenticated user
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
    const updateData: Record<string, unknown> = {};
    if (body.display_name !== undefined) updateData.display_name = body.display_name;
    if (body.api_keys !== undefined) updateData.api_keys = body.api_keys;
    if (body.default_ai !== undefined) updateData.default_ai = body.default_ai;

    const { data: dbUser, error: findError } = await adminClient
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (findError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await adminClient
      .from("users")
      .update(updateData)
      .eq("id", dbUser.id);

    if (updateError) {
      console.error("Error saving profile:", updateError);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PUT /api/user/profile error:", e);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
