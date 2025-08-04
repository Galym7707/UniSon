import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseConfig, EnvironmentValidationError } from '../env'

export const createServerSupabase = async () => {
  try {
    const { url, anonKey } = getSupabaseConfig()
    
    const cookieStore = await cookies()
    return createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    })
  } catch (error) {
    // For build time, return a mock client when environment validation fails
    if (error instanceof EnvironmentValidationError) {
      console.warn('Supabase environment variables not properly configured during build - using placeholder client')
      return createServerClient('https://placeholder.supabase.co', 'placeholder-key', {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      })
    }
    
    // Re-throw the error for runtime usage to get helpful error messages
    throw error
  }
}