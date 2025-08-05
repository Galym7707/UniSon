// 📁 app/auth/signup/action.ts
"use server"

import { z } from "zod"
import validator from "validator"
import DOMPurify from "dompurify"
import { JSDOM } from "jsdom"
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { createServerSupabase } from "@/lib/supabase/server"

/**
 * -------------------------------------------------------------
 *  SERVER‑SIDE SIGN‑UP ACTION (supports employer & job‑seeker)
 * -------------------------------------------------------------
 */

type Role = "employer" | "job-seeker"

// Create a DOMPurify instance for server‑side XSS sanitisation
const window = new JSDOM("").window
const purify = DOMPurify(window as any)

// Password strength: ≥ 8 chars, 1 upper, 1 lower, 1 digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/

/**
 * Zod schema for incoming form data
 */
const signupSchema = z
  .object({
    role: z.enum(["employer", "job-seeker"]),
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be less than 100 characters")
      .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters")
      .optional(),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Full name can only contain letters, spaces, apostrophes, and hyphens"),
    email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(passwordRegex, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
  })
  .refine(
    (data) => {
      // Employer must provide a company name
      if (data.role === "employer" && !data.companyName) return false
      return true
    },
    {
      message: "Company name is required for employers",
      path: ["companyName"],
    },
  )

/** Utility: sanitize a single input string (server‑side) */
function sanitize(input: string): string {
  const cleaned = purify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  return validator.escape(validator.trim(cleaned))
}

export async function signupAction(_: unknown, formData: FormData) {
  try {
    /* ---------------------------------------------------------
     * 1️⃣  Extract & sanitise raw form values
     * -------------------------------------------------------*/
    const raw = {
      role: formData.get("role") as Role,
      companyName: (formData.get("companyName") as string | null) ?? undefined,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const safe = {
      role: raw.role,
      companyName: raw.companyName ? sanitize(raw.companyName) : undefined,
      fullName: sanitize(raw.fullName),
      email: sanitize(raw.email),
      password: raw.password, // never mutate the password string
    }

    /* ---------------------------------------------------------
     * 2️⃣  Validate with Zod + additional checks
     * -------------------------------------------------------*/
    const parsed = signupSchema.safeParse(safe)
    if (!parsed.success) {
      return {
        success: false,
        message: "Please check your input and try again.",
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    // Extra email sanity check
    if (!validator.isEmail(parsed.data.email)) {
      return { success: false, message: "Please enter a valid email address." }
    }

    /* ---------------------------------------------------------
     * 3️⃣  Create user in Supabase Auth
     * -------------------------------------------------------*/
    const supabase = await createServerSupabase()

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          role: parsed.data.role,
          fullName: parsed.data.fullName,
          companyName: parsed.data.companyName ?? null,
        },
        emailRedirectTo:
          parsed.data.role === "employer" ? `${process.env.NEXT_PUBLIC_SITE_URL}/employer/dashboard` : `${process.env.NEXT_PUBLIC_SITE_URL}/job-seeker/dashboard`,
      },
    })

    if (error) {
      // Log + return friendly message
      const structured = logError("signup-action", error, {
        email: parsed.data.email,
        role: parsed.data.role,
      })
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error),
        errorId: structured.id,
      }
    }

    /* ---------------------------------------------------------
     * 4️⃣  Success 🎉
     * -------------------------------------------------------*/
    return {
      success: true,
      message: "Account created! Check your inbox to confirm your email.",
      role: parsed.data.role,
    }
  } catch (err) {
    const structured = logError("signup-action", err)
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      errorId: structured.id,
    }
  }
}
