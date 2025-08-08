"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { createServerSupabaseAdmin } from "@/lib/supabase/admin"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"

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

    /* ---------- create profile record ---------- */
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        role: userRole,
        first_name: parsed.first_name.trim(),
        last_name: parsed.last_name.trim(),
        company_name: parsed.companyName || null,
        email: parsed.email,
      })

    if (profileError) {
      // Clean up auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user after profile creation failure:", cleanupError)
      }
      throw profileError
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