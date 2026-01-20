import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const adminClient = createSupabaseAdmin();

// GET - Get settings by type
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;

    const { data, error } = await adminClient
      .from('creator_settings')
      .select('*')
      .eq('setting_key', type)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return NextResponse.json({
      setting_key: type,
      setting_value: data?.setting_value || null,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST/PUT - Save settings
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    const body = await request.json();

    const { data: existing } = await adminClient
      .from('creator_settings')
      .select('id')
      .eq('setting_key', type)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await adminClient
        .from('creator_settings')
        .update({
          setting_value: body,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', type)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Create new
      const { data, error } = await adminClient
        .from('creator_settings')
        .insert({
          setting_key: type,
          setting_value: body,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
