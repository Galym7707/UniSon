'use server'

import { z } from 'zod'
import validator from 'validator'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import { createServerSupabase } from '@/lib/supabase/server'

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(1000, 'Password is too long')
})

function sanitizeInput(input: string): string {
  // First, sanitize HTML/JavaScript content
  const cleaned = purify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  })
  
  // Then escape special characters and normalize
  return validator.escape(validator.trim(cleaned))
}

export async function loginAction(_prev: any, form: FormData) {
  try {
    const rawEmail = form.get('email') as string | null
    const rawPassword = form.get('password') as string | null

    if (!rawEmail || !rawPassword) {
      return { success: false, message: 'Email and password are required' }
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(rawEmail)
    const sanitizedPassword = rawPassword // Don't sanitize password as it may contain special chars intentionally

    // Validate sanitized inputs
    const validationResult = loginSchema.safeParse({
      email: sanitizedEmail,
      password: sanitizedPassword
    })

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      const firstError = Object.values(errors)[0]?.[0] || 'Invalid input'
      return { success: false, message: firstError }
    }

    const { email, password } = validationResult.data

    // Additional server-side email validation
    if (!validator.isEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' }
    }

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