import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

let _supabase: ReturnType<typeof createServerClient> | null = null;

export function getSupabaseServer() {
  if (!_supabase) {
    const cookieStore = cookies();   // ← awaited implicitly in async RSC

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

export function createServerSupabase() {
  const cookieStore = cookies();   // ← awaited implicitly in async RSC

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