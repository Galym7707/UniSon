"use server"

import { z } from "zod"
import { createUser } from "@/lib/db"

const signupSchema = z.object({
  role: z.enum(["employer", "employee"]),
  companyName: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signupAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = signupSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your entries.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    // Simulate a delay for network latency
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate creating a user in the database
    const user = await createUser(parsed.data)
    console.log("User created:", user)

    // On success, return a success message and the user's role
    // In a real app, you would redirect the user here.
    return {
      success: true,
      message: "Account created successfully!",
      role: parsed.data.role,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    }
  }
}
