'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function loginAction(_prev: any, form: FormData) {
  const email    = form.get('email') as string | null
  const password = form.get('password') as string | null

  if (!email || !password)
    return { success: false, message: 'Email and password are required' }

  /* ───── важно:  БЕЗ await ───── */
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  return error
    ? { success: false, message: error.message }
    : { success: true,  message: 'Logged in successfully' }
}
