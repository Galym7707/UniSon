// 📁 lib/supabase/browser.ts
import { createClient } from '@supabase/supabase-js'

export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // For build time, return a mock client that won't actually work
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables not found during build')
      return createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    }
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}