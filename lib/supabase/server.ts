import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

let _supabase: ReturnType<typeof createServerClient> | null = null;

export async function getSupabaseServer() {
  if (!_supabase) {
    const cookieStore = await cookies();   // ← add await

    _supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }))
          },
        },
      },
    );
  }
  return _supabase;
}

export async function createServerSupabase() {
  const cookieStore = await cookies();   // ← add await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }))
        },
      },
    },
  );
}