/* app/auth/signup/action.ts */

import { redirect } from "next/navigation"
import { z } from "zod"

import { createServerSupabase, createServerSupabaseAdmin } from "@/lib/supabase/server"
import { getUserFriendlyErrorMessage, showErrorToast } from "@/lib/error-handling"

/* ---------- validation schema ---------- */
const signupSchema = z
  .object({
    role: z.enum(["employer", "job-seeker"]),
    companyName: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/)
      .optional(),
    first_name: z
      .string()
      .min(2)
      .max(25)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    last_name: z
      .string()
      .min(2)
      .max(25)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
  })
  .refine((d) => (d.role === "employer" ? !!d.companyName : true), {
    path: ["companyName"],
    message: "Company name is required for employers",
  })

export async function signupAction(_prev: unknown, formData: FormData) {
  try {
    /* sanitize + validate */
    const parsed = signupSchema.parse({
      role: formData.get("role"),
      companyName: formData.get("companyName") || undefined,
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    // Additional validation for required first_name and last_name
    if (!parsed.first_name || parsed.first_name.trim().length === 0) {
      return { error: "First name is required" }
    }
    
    if (!parsed.last_name || parsed.last_name.trim().length === 0) {
      return { error: "Last name is required" }
    }

    const supabase = await createServerSupabase()
    const supabaseAdmin = await createServerSupabaseAdmin()

    /* ---------- 1. создаём пользователя ---------- */
    let authData, authError
    try {
      const response = await supabase.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          data: {
            role: parsed.role,
            first_name: parsed.first_name,
            last_name: parsed.last_name,
            companyName: parsed.companyName ?? null,
          },
        },
      })
      authData = response.data
      authError = response.error
    } catch (error: any) {
      return { error: getUserFriendlyErrorMessage(error) }
    }

    if (authError) {
      return { error: getUserFriendlyErrorMessage(authError) }
    }

    const userId = authData.user?.id
    if (!userId) {
      return { error: "User creation failed - no user ID returned" }
    }

    /* ---------- 2. создаём запись в profiles (id = auth.uid) ---------- */
    try {
      const { error: profErr } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        role: parsed.role,
        first_name: parsed.first_name.trim(),
        last_name: parsed.last_name.trim(),
        company_name: parsed.companyName ?? null,
        email: parsed.email,
      })

      if (profErr) {
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
      return { error: "Failed to create user profile. Please try again." }
    }

    /* ---------- 3. создаём запись в company_profiles, если роль = employer ---------- */
    if (parsed.role === "employer" && parsed.companyName) {
      try {
        const { error: companyErr } = await supabaseAdmin.from("company_profiles").insert({
          user_id: userId,
          company_name: parsed.companyName,
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

    /* ---------- 4. перенаправить, зависит от роли ---------- */
    if (parsed.role === "employer") {
      redirect("/employer/dashboard")
    } else {
      redirect("/job-seeker/dashboard")
    }
  } catch (err: any) {
    // Enhanced error handling for validation errors
    if (err.name === "ZodError") {
      const firstError = err.errors[0]
      if (firstError) {
        return { error: firstError.message }
      }
    }
    
    const message = getUserFriendlyErrorMessage(err)
    return { error: message }
  }
}