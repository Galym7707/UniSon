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
  // Validate role before any database operations
  if (data.role !== "employer" && data.role !== "job-seeker") {
    throw new Error("Invalid role. Role must be exactly 'employer' or 'job-seeker'")
  }
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
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add role-specific default values
    if (data.role === "job-seeker") {
      profileData.experience_level = 'mid' // Default value
      profileData.remote_preference = true // Default value
      profileData.availability_status = 'available' // Default value
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
        constraintViolations: (profErr as any).constraint,
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

      // Handle specific PostgreSQL constraint violation errors
      if (profErr.code === "23514") {
        // Check constraint violation - likely invalid role value
        const errorDetails = profErr.details || profErr.message || ""
        if (errorDetails.includes("role") || profErr.message?.includes("role") || errorDetails.includes("check_valid_role")) {
          throw new Error("Invalid role specified")
        }
        // Generic check constraint violation
        throw new Error("The provided data violates database validation rules. Please check your input values and try again.")
      }

      // Handle other common constraint violations
      if (profErr.code === "23505") {
        // Unique constraint violation
        const errorDetails = profErr.details || profErr.message || ""
        if (errorDetails.includes("email") || profErr.message?.includes("email")) {
          throw new Error("An account with this email address already exists. Please use a different email or sign in instead.")
        }
        throw new Error("A profile with this information already exists. Please check your details and try again.")
      }

      if (profErr.code === "23503") {
        // Foreign key constraint violation
        throw new Error("Invalid data reference detected. Please try again or contact support if the problem persists.")
      }

      if (profErr.code === "23502") {
        // Not null constraint violation
        const errorDetails = profErr.details || profErr.message || ""
        const fieldMatch = errorDetails.match(/column "([^"]+)"/) || errorDetails.match(/([a-zA-Z_]+)_not_null/)
        const field = fieldMatch ? fieldMatch[1] : "required field"
        throw new Error(`Missing required field: ${field}. Please ensure all required information is provided.`)
      }

      // Generic constraint violation handler
      if (profErr.code?.startsWith("23")) {
        const constraintDetails = profErr.details ? ` (${profErr.details})` : ""
        throw new Error(`Database constraint violation${constraintDetails}. Please verify your input data meets all requirements and try again.`)
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

    // If it's already a handled constraint error, re-throw as is
    if (error?.message?.includes("Invalid role specified") || 
        error?.message?.includes("violates database validation rules") ||
        error?.message?.includes("already exists") ||
        error?.message?.includes("Invalid data reference") ||
        error?.message?.includes("Missing required field") ||
        error?.message?.includes("Database constraint violation")) {
      throw error
    }

    // Handle specific PostgreSQL errors that might not be caught above
    if (error?.code === "23514") {
      // Check constraint violation - likely invalid role value
      const errorDetails = error.details || error.message || ""
      if (errorDetails.includes("role") || error.message?.includes("role") || errorDetails.includes("check_valid_role")) {
        throw new Error("Invalid role specified")
      }
      throw new Error("The provided data violates database validation rules. Please check your input values and try again.")
    }

    if (error?.code === "23505") {
      // Unique constraint violation
      const errorDetails = error.details || error.message || ""
      if (errorDetails.includes("email") || error.message?.includes("email")) {
        throw new Error("An account with this email address already exists. Please use a different email or sign in instead.")
      }
      throw new Error("A profile with this information already exists. Please check your details and try again.")
    }

    if (error?.code === "23503") {
      // Foreign key constraint violation
      throw new Error("Invalid data reference detected. Please try again or contact support if the problem persists.")
    }

    if (error?.code === "23502") {
      // Not null constraint violation
      const errorDetails = error.details || error.message || ""
      const fieldMatch = errorDetails.match(/column "([^"]+)"/) || errorDetails.match(/([a-zA-Z_]+)_not_null/)
      const field = fieldMatch ? fieldMatch[1] : "required field"
      throw new Error(`Missing required field: ${field}. Please ensure all required information is provided.`)
    }

    // Generic constraint violation handler for other 23xxx codes
    if (error?.code?.startsWith("23")) {
      const constraintDetails = error.details ? ` (${error.details})` : ""
      throw new Error(`Database constraint violation${constraintDetails}. Please verify your input data meets all requirements and try again.`)
    }

    // For non-constraint errors, provide a more informative but still generic message
    const errorDetails = error?.message || "Unknown database error"
    const errorCode = error?.code ? ` (Code: ${error.code})` : ""
    
    throw new Error(`Failed to create user profile: ${errorDetails}${errorCode}. Please try again or contact support if the problem persists.`)
  }

  /* ---------- 3. создаём запись в companies, если роль = employer ---------- */
  if (data.role === "employer" && data.companyName) {
    try {
      // Define the company data type explicitly
      interface CompanyData {
        owner_id: string;
        name: string;
        website?: string;
        logo_url?: string;
        industry?: string;
        size?: string;
        description?: string;
        location?: string;
        created_at: string;
        updated_at: string;
      }

      const companyData: CompanyData = {
        owner_id: userId,
        name: data.companyName?.trim() || "",
        website: "",
        logo_url: "",
        industry: "",
        size: "",
        description: "",
        location: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: companyErr } = await supabaseAdmin.from("companies").insert(companyData)

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
