"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createUserAccount } from "@/lib/supabase/server-utils"
import { getUserFriendlyErrorMessage, logError } from "@/lib/error-handling"

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
  .refine((data) => (data.role === "employer" ? !!data.companyName : true), {
    path: ["companyName"],
    message: "Company name is required for employers",
  })

interface SignupResult {
  error?: string
  success?: boolean
  field?: string
}

export async function signupAction(_prev: unknown, formData: FormData): Promise<SignupResult> {
  try {
    /* ---------- Form data extraction and validation ---------- */
    const rawData = {
      role: formData.get("role"),
      companyName: formData.get("companyName") || undefined,
      first_name: formData.get("first_name") || undefined,
      last_name: formData.get("last_name") || undefined,
      email: formData.get("email"),
      password: formData.get("password"),
    }

    // Log signup attempt for monitoring (without sensitive data)
    // Validate role value before proceeding
    if (rawData.role !== "employer" && rawData.role !== "job-seeker") {
      return { 
        error: "Invalid role selection. Please select either 'employer' or 'job-seeker'", 
        field: "role" 
      }
    }

    console.log("Signup attempt for:", rawData.email, "Role:", rawData.role)

    // Validate form data
    let parsedData
    try {
      parsedData = signupSchema.parse(rawData)
    } catch (validationError: any) {
      logError("signup-validation", validationError, {
        userEmail: rawData.email?.toString(),
        userRole: rawData.role?.toString(),
      })

      if (validationError.name === "ZodError") {
        const firstError = validationError.errors[0]
        if (firstError) {
          // Map field paths to user-friendly field names
          const fieldMapping: Record<string, string> = {
            first_name: "first name",
            last_name: "last name",
            companyName: "company name",
            email: "email",
            password: "password",
            role: "role",
          }

          const fieldName = fieldMapping[firstError.path[0]] || firstError.path[0]
          
          // Provide specific validation error messages
          let message = firstError.message
          if (firstError.code === "too_small") {
            message = `${fieldName} must be at least ${firstError.minimum} characters`
          } else if (firstError.code === "too_big") {
            message = `${fieldName} must be no more than ${firstError.maximum} characters`
          } else if (firstError.code === "invalid_string") {
            if (firstError.validation === "email") {
              message = "Please enter a valid email address"
            } else if (firstError.validation === "regex") {
              if (firstError.path[0] === "password") {
                message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
              } else if (firstError.path[0] === "first_name" || firstError.path[0] === "last_name") {
                message = `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
              } else if (firstError.path[0] === "companyName") {
                message = "Company name contains invalid characters"
              }
            }
          } else if (firstError.code === "invalid_enum_value") {
            message = "Please select a valid role"
          }

          return { 
            error: message, 
            field: firstError.path[0]?.toString() 
          }
        }
      }
      
      return { error: "Please check your input and try again" }
    }

    // Additional validation for required fields (both roles)
    if (!parsedData.first_name || parsedData.first_name.trim().length === 0) {
      return { error: "First name is required", field: "first_name" }
    }
    
    if (!parsedData.last_name || parsedData.last_name.trim().length === 0) {
      return { error: "Last name is required", field: "last_name" }
    }

    if (!parsedData.email || parsedData.email.trim().length === 0) {
      return { error: "Email is required", field: "email" }
    }

    if (!parsedData.password || parsedData.password.trim().length === 0) {
      return { error: "Password is required", field: "password" }
    }

    /* ---------- Account creation with comprehensive error handling ---------- */
    let accountResult
    try {
      accountResult = await createUserAccount({
        role: parsedData.role,
        first_name: parsedData.first_name?.trim() || "",
        last_name: parsedData.last_name?.trim() || "",
        email: parsedData.email.trim().toLowerCase(),
        password: parsedData.password,
        companyName: parsedData.companyName?.trim(),
      })
    } catch (accountError: any) {
      logError("signup-account-creation", accountError, {
        userEmail: parsedData.email,
        userRole: parsedData.role,
      })

      // Handle specific Supabase auth errors
      if (accountError?.message?.includes("User already registered")) {
        return { 
          error: "An account with this email already exists. Please sign in instead or use a different email address.",
          field: "email"
        }
      }

      if (accountError?.message?.includes("Email rate limit exceeded")) {
        return { 
          error: "Too many signup attempts with this email. Please wait 15 minutes before trying again.",
          field: "email"
        }
      }

      if (accountError?.message?.includes("Password should be at least")) {
        return { 
          error: "Password must be at least 6 characters long",
          field: "password"
        }
      }

      if (accountError?.message?.includes("Invalid email")) {
        return { 
          error: "Please enter a valid email address",
          field: "email"
        }
      }

      if (accountError?.message?.includes("Signup is disabled")) {
        return { 
          error: "Account registration is currently disabled. Please contact support."
        }
      }

      if (accountError?.message?.includes("Email domain not allowed")) {
        return { 
          error: "Email domain not allowed for registration",
          field: "email"
        }
      }

      // Handle database constraint violations
      if (accountError?.code === "23505" || accountError?.message?.includes("duplicate key")) {
        return { 
          error: "An account with this email already exists. Please use a different email address.",
          field: "email"
        }
      }

      if (accountError?.code === "23514" || accountError?.message?.includes("check constraint")) {
        // Check if this is a role constraint violation
        if (accountError?.message?.includes("Invalid role specified")) {
          return {
            error: "Invalid role specified",
            field: "role"
          }
        }
        return { 
          error: "Invalid data provided. Please check your input and try again."
        }
      }

      if (accountError?.code === "23503" || accountError?.message?.includes("foreign key")) {
        return { 
          error: "Data reference error. Please try again or contact support."
        }
      }

      // Handle network and connection errors
      if (accountError?.message?.includes("network") || 
          accountError?.message?.includes("fetch") || 
          accountError?.code === "NETWORK_ERROR") {
        return { 
          error: "Network connection error. Please check your internet connection and try again."
        }
      }

      // Handle timeout errors
      if (accountError?.message?.includes("timeout") || accountError?.code === "TIMEOUT") {
        return { 
          error: "The request timed out. Please try again."
        }
      }

      // Handle server errors
      if (accountError?.message?.includes("Internal server error") || 
          accountError?.code?.toString().startsWith("5")) {
        return { 
          error: "Server error occurred. Please try again in a few moments."
        }
      }

      // Handle service unavailable
      if (accountError?.message?.includes("Service unavailable") || 
          accountError?.code === "503") {
        return { 
          error: "Service is temporarily unavailable. Please try again later."
        }
      }

      // Handle rate limiting
      if (accountError?.message?.includes("Too many requests") || 
          accountError?.code === "429") {
        return { 
          error: "Too many requests. Please wait a moment and try again."
        }
      }

      // Handle profile creation errors
      if (accountError?.message?.includes("Failed to create user profile")) {
        return { 
          error: "Failed to create user profile. Please try again or contact support if the problem persists."
        }
      }

      // Use the error handling utility for any other errors
      const userFriendlyMessage = getUserFriendlyErrorMessage(accountError)
      return { 
        error: userFriendlyMessage || "An unexpected error occurred during account creation. Please try again."
      }
    }

    // Validate account creation result
    if (!accountResult || !accountResult.userId) {
      logError("signup-invalid-result", new Error("Account creation returned invalid result"), {
        userEmail: parsedData.email,
        userRole: parsedData.role,
        result: accountResult,
      })
      
      return { 
        error: "Account creation failed. Please try again or contact support."
      }
    }

    console.log("Signup successful for:", parsedData.email, "User ID:", accountResult.userId)

    /* ---------- Role-based redirect ---------- */
    try {
      if (accountResult.role === "employer") {
        redirect("/employer/dashboard")
      } else {
        redirect("/job-seeker/dashboard")
      }
    } catch (redirectError: any) {
      logError("signup-redirect", redirectError, {
        userId: accountResult.userId,
        userEmail: parsedData.email,
        userRole: accountResult.role,
      })

      // If redirect fails, we still want to indicate success
      // The redirect error is likely a Next.js internal issue
      return { success: true }
    }

  } catch (error: any) {
    // Catch-all error handler for any unexpected errors
    logError("signup-unexpected-error", error, {
      userEmail: formData.get("email")?.toString(),
      userRole: formData.get("role")?.toString(),
    })

    // Don't expose sensitive error details to the user
    return { 
      error: "An unexpected error occurred. Please try again or contact support if the problem persists."
    }
  }
}