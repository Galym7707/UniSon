"use server"

import { z } from "zod"
import validator from "validator"
import DOMPurify from "dompurify"
import { JSDOM } from "jsdom"
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { createServerSupabase } from "@/lib/supabase/server"
import { createServerSupabaseAdmin } from "@/lib/supabase/admin"

const window = new JSDOM("").window
const purify = DOMPurify(window as any)

/* ---------- schema (две роли) ---------- */
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

    if (profErr && profErr.code !== "23505") throw profErr // ignore duplicate

    return { success: true, message: "Account created! Confirm your email." }
  } catch (err) {
    const structured = logError("signup-action", err)
    return { success: false, message: getUserFriendlyErrorMessage(err), errorId: structured.id }
  }
}