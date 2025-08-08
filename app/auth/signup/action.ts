/* app/auth/signup/action.ts */
"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { createUserAccount } from "@/lib/supabase/server-utils"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"

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

    const { role } = await createUserAccount({
      role: parsed.role,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      email: parsed.email,
      password: parsed.password,
      companyName: parsed.companyName,
    })

    /* ---------- перенаправить, зависит от роли ---------- */
    if (role === "employer") {
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