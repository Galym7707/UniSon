import { createClient } from '@supabase/supabase-js';

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

/**
 * Creates a Supabase client with service role key for admin operations.
 * This client bypasses Row Level Security policies and should only be used
 * for administrative operations like user creation during signup.
 * 
 * @returns Supabase client instance with admin privileges
 */
export function createServerSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Supabase admin env vars are missing. Did you set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY?"
      );
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return _supabaseAdmin;
}