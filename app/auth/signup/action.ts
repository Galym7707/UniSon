"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { createServerSupabaseAdmin } from "@/lib/supabase/admin"
import { getUserFriendlyErrorMessage, logError } from "@/lib/error-handling"

/* ---------- validation schema ---------- */
const signupSchema = z
  .object({
    role: z.enum(["employer", "job-seeker"]),
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(25, "First name must be less than 25 characters")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"),
    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(25, "Last name must be less than 25 characters")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"),
    email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
    user_type: z.enum(["employer", "job-seeker"]).optional(), // Support both 'role' and 'user_type' fields
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be less than 100 characters")
      .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters")
      .optional(),
  })
  .refine((data) => {
    // Use user_type if provided, otherwise fall back to role
    const userRole = data.user_type || data.role
    return userRole === "employer" ? !!data.companyName : true
  }, {
    path: ["companyName"],
    message: "Company name is required for employers",
  })

interface ProfileCreationData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

// Server-side version of ensureUserProfile for use after user creation
async function ensureUserProfile(profileData: ProfileCreationData) {
  try {
    const supabaseAdmin = createServerSupabaseAdmin()
    const MAX_RETRIES = 3
    let retryCount = 0

    // First, try to fetch existing profile with retry logic
    let existingProfile = null
    let profileError = null

    while (retryCount < MAX_RETRIES) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', profileData.id)
        .single()

      if (data && !error) {
        existingProfile = data
        profileError = null
        break
      }

      if (error && error.code === 'PGRST116') {
        // No rows returned - profile doesn't exist, this is expected
        profileError = error
        break
      }

      if (error && (error.message.includes('timeout') || error.message.includes('network'))) {
        retryCount++
        if (retryCount < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          continue
        }
      }

      profileError = error
      break
    }

    // If profile exists, return it
    if (existingProfile && !profileError) {
      return {
        profile: existingProfile,
        error: null,
        wasCreated: false
      }
    }

    // If error is not "no rows returned", it's a real error
    if (profileError && profileError.code !== 'PGRST116') {
      if (profileError.code === '42P01') {
        throw new Error('Database configuration error. Please contact support.')
      }
      if (profileError.code === '42501') {
        throw new Error('Database access denied. Please contact support.')
      }
      if (profileError.message.includes('timeout')) {
        throw new Error('Database timeout. Please try again in a moment.')
      }
      throw new Error(`Profile fetch error: ${profileError.message}`)
    }

    // Profile doesn't exist, create it
    const newProfile = {
      id: profileData.id,
      email: profileData.email,
      role: profileData.role,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      title: '',
      summary: '',
      experience: '',
      skills: '',
      resume_url: null
    }

    // Create profile with retry logic
    let createdProfile = null
    let createError = null
    retryCount = 0

    while (retryCount < MAX_RETRIES) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (data && !error) {
        createdProfile = data
        createError = null
        break
      }

      if (error && (error.message.includes('timeout') || error.message.includes('network'))) {
        retryCount++
        if (retryCount < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          continue
        }
      }

      createError = error
      break
    }

    if (createError) {
      if (createError.code === '23505') {
        // Profile already exists (race condition), try to fetch it
        const { data: raceProfile, error: raceError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', profileData.id)
          .single()

        if (raceProfile && !raceError) {
          return {
            profile: raceProfile,
            error: null,
            wasCreated: false
          }
        }
        throw new Error('Profile creation conflict. Please refresh the page and try again.')
      }
      if (createError.code === '23502') {
        throw new Error('Missing required profile information. Please contact support.')
      }
      if (createError.code === '42501') {
        throw new Error('Permission denied. Please contact support.')
      }
      if (createError.code === '42P01') {
        throw new Error('Database configuration error. Please contact support.')
      }
      throw new Error(`Profile creation failed: ${createError.message}`)
    }

    if (!createdProfile) {
      throw new Error('Profile creation failed: No profile data returned.')
    }

    return {
      profile: createdProfile,
      error: null,
      wasCreated: true
    }

  } catch (err) {
    const errorMessage = getUserFriendlyErrorMessage(err)
    logError('server-ensure-user-profile', err, {
      userId: profileData.id,
      timestamp: new Date().toISOString()
    })
    
    return {
      profile: null,
      error: errorMessage,
      wasCreated: false
    }
  }
}

export async function signupAction(_prev: unknown, formData: FormData): Promise<{ error?: string; success?: boolean; message?: string } | null> {
  try {
    /* ---------- extract and validate form data ---------- */
    const rawData = {
      role: (formData.get("role") as string) || (formData.get("user_type") as string),
      user_type: formData.get("user_type") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      companyName: formData.get("companyName") as string || undefined,
    }

    // Additional validation for required fields
    if (!rawData.first_name || rawData.first_name.trim().length === 0) {
      return { error: "First name is required" }
    }
    
    if (!rawData.last_name || rawData.last_name.trim().length === 0) {
      return { error: "Last name is required" }
    }

    if (!rawData.email || rawData.email.trim().length === 0) {
      return { error: "Email is required" }
    }

    if (!rawData.password || rawData.password.length === 0) {
      return { error: "Password is required" }
    }

    const parsed = signupSchema.parse(rawData)
    
    // Determine the role (support both field names)
    const userRole = (parsed.user_type || parsed.role) as "employer" | "job-seeker"

    /* ---------- create user with admin client ---------- */
    const supabaseAdmin = createServerSupabaseAdmin()

    // Create user via auth.admin.createUser
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        role: userRole,
        first_name: parsed.first_name.trim(),
        last_name: parsed.last_name.trim(),
        companyName: parsed.companyName || null,
      },
    })

    if (authError) {
      throw authError
    }

    const userId = authData.user?.id
    if (!userId) {
      throw new Error("User creation failed - no user ID returned")
    }

    /* ---------- create profile record using ensureUserProfile ---------- */
    try {
      const profileResult = await ensureUserProfile({
        id: userId,
        email: parsed.email,
        first_name: parsed.first_name.trim(),
        last_name: parsed.last_name.trim(),
        role: userRole,
      })

      if (profileResult.error) {
        // Log the profile creation error but don't fail the entire signup
        // The user account was successfully created
        logError('signup-profile-creation-failed', new Error(profileResult.error), {
          userId: userId,
          email: parsed.email,
        })
        
        // The profile will be created later via the fallback mechanism
        // when the user first accesses their dashboard
      }
    } catch (profileError) {
      // Log any unexpected errors during profile creation
      logError('signup-profile-creation-error', profileError, {
        userId: userId,
        email: parsed.email,
      })
      
      // Continue with successful signup - profile will be created via fallback
    }

    /* ---------- create company profile for employers ---------- */
    if (userRole === "employer" && parsed.companyName) {
      try {
        const { error: companyError } = await supabaseAdmin
          .from("company_profiles")
          .insert({
            user_id: userId,
            company_name: parsed.companyName,
            website: "",
            industry: "",
            company_size: "",
            description: "",
            location: "",
          })

        if (companyError) {
          console.error("Failed to create company profile:", companyError)
          // Don't fail signup for company profile errors - user can create it later
        }
      } catch (error) {
        console.error("Error creating company profile:", error)
        // Don't fail signup for company profile errors
      }
    }

    /* ---------- redirect based on role ---------- */
    if (userRole === "employer") {
      redirect("/employer/dashboard")
    } else {
      redirect("/job-seeker/dashboard")
    }

  } catch (err: any) {
    // Handle validation errors
    if (err.name === "ZodError") {
      const firstError = err.errors[0]
      if (firstError) {
        return { error: firstError.message }
      }
      return { error: "Please check your input and try again" }
    }
    
    // Handle other errors
    const message = getUserFriendlyErrorMessage(err)
    return { error: message }
  }

  // This should never be reached due to redirect, but TypeScript requires it
  return null
}