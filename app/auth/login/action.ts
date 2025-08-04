'use server'

import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import { createServerSupabase } from '@/lib/supabase/server'

export async function loginAction(_prev: any, form: FormData) {
  const email = form.get('email') as string | null
  const password = form.get('password') as string | null

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  try {
    const supabase = await createServerSupabase()
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