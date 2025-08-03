"use server"

import { z } from "zod"
import { findUserByEmail } from "@/lib/db"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find the user in our mock database
    const user = await findUserByEmail(parsed.data.email)

    // In a real app, you would compare hashed passwords here.
    // For this demo, we'll just check if the user exists.
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    // On success, return the user's role for redirection
    return {
      success: true,
      message: "Login successful!",
      role: user.role,
    }
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}
