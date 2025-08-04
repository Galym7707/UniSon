// 📁 app/auth/signup/action.ts
"use server"

import { z } from "zod"
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import { createServerSupabase } from '@/lib/supabase/server'

const signupSchema = z.object({
  role: z.enum(["employer", "employee"]),
  companyName: z.string().optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function signupAction(_prev: unknown, formData: FormData) {
  try {
    const data = Object.fromEntries(formData)
    const parsed = signupSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        message: "Invalid data", 
        errors: parsed.error.flatten().fieldErrors 
      }
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        // сохраняем роль и прочее в user_metadata
        data: {
          role: parsed.data.role,
          fullName: parsed.data.fullName,
          companyName: parsed.data.companyName ?? null,
        },
      },
    })

    if (error) {
      logError('signup-action', error)
      return { 
        success: false, 
        message: getUserFriendlyErrorMessage(error)
      }
    }

    return { 
      success: true, 
      message: "Account created!", 
      role: parsed.data.role 
    }
  } catch (error) {
    logError('signup-action', error)
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    }
  }
}