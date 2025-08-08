import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

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

export async function createRouteHandlerClient() {
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

export function createServerSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}