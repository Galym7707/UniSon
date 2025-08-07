// lib/supabase/browser.ts – **client‑side singleton**
"use client";

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { startTransition } from 'react'

// ---------------------------------------------------------------------------
// Environment - gracefully handle missing env vars during build
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw in runtime if we try to use the client without env vars
function checkEnvironment() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase env vars are missing. Did you set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY?"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton helper
// ---------------------------------------------------------------------------
let _supabase:
  | ReturnType<typeof _createBrowserClient>
  | null = null;

/**
 * Always returns the **same** `SupabaseClient` instance in the browser.
 *
 * ```ts
 * import { getSupabaseBrowser } from "@/lib/supabase/browser";
 * const supabase = getSupabaseBrowser();
 * ```
 */
export function getSupabaseBrowser() {
  if (!_supabase) {
    checkEnvironment(); // Only check env when actually creating the client
    _supabase = _createBrowserClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _supabase;
}

// ---------------------------------------------------------------------------
// ️🔄  Backwards‑compat helpers ------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * Some legacy components still import `{ createBrowserClient }` from this file
 * and call it without arguments – e.g.:
 *
 * ```ts
 * const supabase = createBrowserClient();
 * ```
 *
 * To avoid a sweeping refactor we keep a shim that simply delegates to
 * `getSupabaseBrowser()`.
 */
export function createBrowserClient() {
  return getSupabaseBrowser();
}

/**
 * For code that imported a pre‑built `supabase` object:
 *
 * ```ts
 * import { supabase } from "@/lib/supabase/browser";
 * ```
 */
export const supabase = (() => {
  // Don't initialize during build process
  if (typeof window === 'undefined') {
    return null as any;
  }
  return getSupabaseBrowser();
})();