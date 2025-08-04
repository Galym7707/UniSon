'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export async function loginAction(_prev: any, form: FormData) {
  const email = form.get('email') as string | null
  const password = form.get('password') as string | null

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    )

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      logError('login-action', error)
      return { 
        success: false, 
        message: getUserFriendlyErrorMessage(error)
      }
    }

    return { success: true, message: 'Logged in successfully' }
  } catch (error) {
    logError('login-action', error)
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    }
  }
}