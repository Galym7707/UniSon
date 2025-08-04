// 📁 lib/supabase/browser.ts
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, EnvironmentValidationError } from '../env'

export const createBrowserClient = () => {
  try {
    const { url, anonKey } = getSupabaseConfig()
    
    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  } catch (error) {
    // For build time, return a mock client when environment validation fails
    if (typeof window === 'undefined' && error instanceof EnvironmentValidationError) {
      console.warn('Supabase environment variables not properly configured during build - using placeholder client')
      return createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    }
    
    // Re-throw the error for runtime usage to get helpful error messages
    throw error
  }
}