import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

let _supabase: ReturnType<typeof createServerClient> | null = null;

export async function getSupabaseServer() {
  if (!_supabase) {
    const cookieStore = await cookies();

    _supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => cookieStore.getAll().forEach(() => {}),
        },
      },
    );
  }
  return _supabase;
}

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: async (name: string, value: string, options: any) => cookieStore.set({ name, value, ...options }),
        remove: async (name: string, options: any) => cookieStore.delete({ name, ...options }),
      },
    },
  );
}