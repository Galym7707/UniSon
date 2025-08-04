// 📁 app/auth/signup/action.ts
"use server"

import { z } from "zod"
import validator from 'validator'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import { createServerSupabase } from '@/lib/supabase/server'

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// Password strength regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

const signupSchema = z.object({
  role: z.enum(["employer", "employee"]),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters")
    .optional(),
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Full name can only contain letters, spaces, apostrophes, and hyphens"),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(passwordRegex, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number")
}).refine((data) => {
  if (data.role === "employer" && !data.companyName) {
    return false
  }
  return true
}, {
  message: "Company name is required for employers",
  path: ["companyName"]
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

export async function signupAction(_prev: unknown, formData: FormData) {
  try {
    const rawData = {
      role: formData.get('role') as string,
      companyName: formData.get('companyName') as string | null,
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string
    }

    // Sanitize inputs (except password which may contain special chars intentionally)
    const sanitizedData = {
      role: rawData.role,
      companyName: rawData.companyName ? sanitizeInput(rawData.companyName) : null,
      fullName: sanitizeInput(rawData.fullName),
      email: sanitizeInput(rawData.email),
      password: rawData.password // Don't sanitize password
    }

    // Remove null companyName for validation if it's empty
    const dataForValidation = {
      ...sanitizedData,
      companyName: sanitizedData.companyName || undefined
    }

    const parsed = signupSchema.safeParse(dataForValidation)
    
    if (!parsed.success) {
      return { 
        success: false, 
        message: "Please check your input and try again", 
        errors: parsed.error.flatten().fieldErrors 
      }
    }

    // Additional server-side validations
    if (!validator.isEmail(parsed.data.email)) {
      return { 
        success: false, 
        message: "Please enter a valid email address" 
      }
    }

    // Check for potentially malicious patterns in name fields
    const namePattern = /[<>{}[\]\\\/]/
    if (namePattern.test(parsed.data.fullName) || 
        (parsed.data.companyName && namePattern.test(parsed.data.companyName))) {
      return { 
        success: false, 
        message: "Name contains invalid characters" 
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
      message: "Account created successfully!", 
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