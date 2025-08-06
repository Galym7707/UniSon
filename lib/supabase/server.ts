import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

let _supabase: ReturnType<typeof createServerClient> | null = null;

export async function getSupabaseServer() {
  if (!_supabase) {
    const cookieStore = await cookies();   // ← await explicitly

    _supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: async (name, value, options) => cookieStore.set({ name, value, ...options }),
          remove: async (name, options) => cookieStore.delete({ name, ...options }),
        },
      },
    );
  }
  return _supabase;
}

export async function createServerSupabase() {
  const cookieStore = await cookies();   // ← await explicitly

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: async (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: async (name, options) => cookieStore.delete({ name, ...options }),
      },
    },
  );
}