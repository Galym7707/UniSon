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

    const supabase = await createServerSupabase()
    const supabaseAdmin = await createServerSupabaseAdmin()

    /* ---------- 1. создаём пользователя ---------- */
    const { data, error } = await supabase.auth.signUp({
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

    if (error) throw error
    const userId = data.user?.id
    if (!userId) throw new Error("User id missing after sign-up")

    /* ---------- 2. создаём запись в profiles (id = auth.uid) ---------- */
    const { error: profErr } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      role: parsed.role,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      company_name: parsed.companyName ?? null,
      email: parsed.email,
    })

    if (profErr) throw profErr

    /* ---------- 3. создаём запись в company_profiles, если роль = employer ---------- */
    if (parsed.role === "employer" && parsed.companyName) {
      const { error: companyErr } = await supabaseAdmin.from("company_profiles").insert({
        user_id: userId,
        company_name: parsed.companyName,
        website: "",
        industry: "",
        company_size: "",
        description: "",
        location: "",
      })

      if (companyErr) throw companyErr
    }

    /* ---------- 4. перенаправить, зависит от роли ---------- */
    if (parsed.role === "employer") {
      redirect("/employer/dashboard")
    } else {
      redirect("/job-seeker/dashboard")
    }
  } catch (err: any) {
    const message = getUserFriendlyErrorMessage(err)
    return { error: message }
  }
}