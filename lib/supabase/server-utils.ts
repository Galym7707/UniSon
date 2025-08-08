/* lib/supabase/server-utils.ts */

import "server-only"
import { createServerSupabase } from "./server"
import { createServerSupabaseAdmin } from "./admin"

export interface SignupData {
  role: "employer" | "job-seeker"
  first_name: string
  last_name: string
  email: string
  password: string
  companyName?: string
}

/**
 * Creates a new user account and associated profile records
 */
export async function createUserAccount(data: SignupData) {
  const supabase = await createServerSupabase()
  const supabaseAdmin = createServerSupabaseAdmin()

  /* ---------- 1. создаём пользователя ---------- */
  let authData, authError
  try {
    const response = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          companyName: data.companyName ?? null,
        },
      },
    })
    authData = response.data
    authError = response.error
  } catch (error: any) {
    throw error
  }

  if (authError) throw authError
  
  const userId = authData.user?.id
  if (!userId) {
    throw new Error("User creation failed - no user ID returned")
  }

  /* ---------- 2. создаём запись в profiles (id = auth.uid) ---------- */
  try {
    const profileData: any = {
      id: userId,
      role: data.role,
      email: data.email,
    }

    // For job seekers, include first_name and last_name
    if (data.role === "job-seeker") {
      profileData.first_name = data.first_name.trim()
      profileData.last_name = data.last_name.trim()
      profileData.company_name = null
    } else {
      // For employers, only include company_name, leave names as null
      profileData.first_name = null
      profileData.last_name = null
      profileData.company_name = data.companyName ?? null
    }

    const { error: profErr } = await supabaseAdmin.from("profiles").insert(profileData)

    if (profErr) {
      // Log comprehensive error details for debugging
      console.error("Profile creation failed - Full error details:", {
        error: profErr,
        errorCode: profErr.code,
        errorMessage: profErr.message,
        errorDetails: profErr.details,
        errorHint: profErr.hint,
        constraintViolations: profErr.constraint,
        userId: userId,
        userEmail: data.email,
        userRole: data.role,
        timestamp: new Date().toISOString()
      })

      // If profile creation fails, we should try to clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (cleanupError) {
        // Log cleanup error but don't expose it to user
        console.error("Failed to cleanup auth user after profile creation failure:", cleanupError)
      }
      throw profErr
    }
  } catch (error: any) {
    // Log the full error object with all available details
    console.error("Profile insertion operation failed - Complete error context:", {
      originalError: error,
      errorName: error?.name,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      constraintViolation: error?.constraint,
      sqlState: error?.sqlState,
      errorStack: error?.stack,
      userId: userId,
      userEmail: data.email,
      userRole: data.role,
      companyName: data.companyName,
      timestamp: new Date().toISOString()
    })

    // Provide more descriptive error message that includes database error information
    const errorDetails = error?.message || "Unknown database error"
    const errorCode = error?.code ? ` (Code: ${error.code})` : ""
    const constraintInfo = error?.constraint ? ` - Constraint: ${error.constraint}` : ""
    
    throw new Error(`Failed to create user profile due to database error: ${errorDetails}${errorCode}${constraintInfo}. Please try again or contact support if the problem persists.`)
  }

  /* ---------- 3. создаём запись в company_profiles, если роль = employer ---------- */
  if (data.role === "employer" && data.companyName) {
    try {
      const { error: companyErr } = await supabaseAdmin.from("company_profiles").insert({
        user_id: userId,
        company_name: data.companyName,
        website: "",
        industry: "",
        company_size: "",
        description: "",
        location: "",
      })

      if (companyErr) {
        // If company profile creation fails, log the error but don't fail the entire signup
        console.error("Failed to create company profile:", companyErr)
        // User can still access the platform and create company profile later
      }
    } catch (error: any) {
      console.error("Error creating company profile:", error)
      // Don't fail signup for company profile errors
    }
  }

  return { userId, role: data.role }
}