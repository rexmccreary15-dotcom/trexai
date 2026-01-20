import { createClient } from '@supabase/supabase-js';

// Public client for browser-side operations (uses anon key)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Admin client for server-side operations (uses service role key)
// WARNING: Only use this on the server side, never expose the service role key to the client
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Singleton client instance to avoid multiple instances
let supabaseClientInstance: ReturnType<typeof createSupabaseClient> | null = null;

// Get or create singleton Supabase client
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient();
  }
  
  return supabaseClientInstance;
}

// Client-side Supabase instance (use singleton)
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

// Helper to get current user (client-side only)
export async function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}
