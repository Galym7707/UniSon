"use client"

import { useActionState, useState, useEffect, startTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"

import { Building2, User, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { signupAction } from "@/app/auth/signup/action"

/* ---------- types & schema ---------- */

type Role = "employer" | "job-seeker"

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/ // ≥8 символов, A-z + a-z + число

const baseSignupSchema = z.object({
  role: z.enum(["employer", "job-seeker"]),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Full name can only contain letters, spaces, apostrophes, and hyphens"),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRegex, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
})

const signupSchema = baseSignupSchema
  .extend({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be less than 100 characters")
      .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.role === "employer" && !data.companyName) return false
      return true
    },
    { message: "Company name is required for employers", path: ["companyName"] },
  )

type SignupFormData = z.infer<typeof signupSchema>

/* ---------- component ---------- */

export function SignupForm() {
  /* state/hooks */
  const [state, formAction, isPending] = useActionState(signupAction, null)
  const [role, setRole] = useState<Role>("job-seeker") // ← по-умолчанию Job Seeker
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { role: "job-seeker" },
  })

  /* redirect после удачного signup */
  useEffect(() => {
    if (state?.success) {
      window.location.href = role === "employer" ? "/employer/dashboard" : "/job-seeker/dashboard"
    }
  }, [state, role])

  /* submit */
  const onSubmit = (data: SignupFormData) => {
    setIsFormSubmitted(true)
    clearErrors()

    const formData = new FormData()
    formData.append("role", data.role)
    formData.append("fullName", data.fullName)
    formData.append("email", data.email)
    formData.append("password", data.password)
    if (data.companyName) formData.append("companyName", data.companyName)

    // 🟢 inside transition – isPending now updates correctly
    startTransition(() => formAction(formData))
  }

  const handleRoleChange = (newRole: Role) => {
    if (!isPending) setRole(newRole)
  }

  /* ---------- UI helpers ---------- */

  const employerFields = (
    <>
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" placeholder="Your Company Inc." disabled={isPending} {...register("companyName")} />
        {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
      </div>
      <div>
        <Label htmlFor="fullName">Your Full Name</Label>
        <Input id="fullName" placeholder="John Doe" disabled={isPending} {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
      </div>
    </>
  )

  const jobSeekerFields = (
    <div>
      <Label htmlFor="fullName">Full Name</Label>
      <Input id="fullName" placeholder="Jane Smith" disabled={isPending} {...register("fullName")} />
      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
    </div>
  )

  /* ---------- success screen ---------- */

  if (state?.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="text-2xl">Success!</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-600">Redirecting…</p>
          <Button asChild className="w-full mt-4">
            <Link href="/">Home</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ---------- main form ---------- */

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Pick your role and join UnisonAI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* hidden role — чтобы дошёл до server action */}
          <input type="hidden" {...register("role")} value={role} />

          {/* role switcher */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* employer */}
            <div
              onClick={() => handleRoleChange("employer")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all",
                role === "employer" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50",
                isPending && "opacity-50 cursor-not-allowed",
              )}
            >
              {role === "employer" && <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-purple-600" />}
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <p className="font-semibold">Employer</p>
            </div>

            {/* job-seeker */}
            <div
              onClick={() => handleRoleChange("job-seeker")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all",
                role === "job-seeker" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50",
                isPending && "opacity-50 cursor-not-allowed",
              )}
            >
              {role === "job-seeker" && <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-purple-600" />}
              <User className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <p className="font-semibold">Job Seeker</p>
            </div>
          </div>

          {role === "employer" ? employerFields : jobSeekerFields}

          {/* email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" disabled={isPending} {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" disabled={isPending} {...register("password")} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            <p className="text-xs text-gray-500 mt-1">At least 8 chars with upper-, lower-case and number</p>
          </div>

          {/* server-side error */}
          {state && !state.success && state.message && <ErrorDisplay error={state.message} variant="card" />}

          <Button type="submit" className="w-full" disabled={isPending || (isFormSubmitted && !isValid)}>
            <LoadingButton isLoading={isPending} loadingText="Creating Account…">
              Create account
            </LoadingButton>
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-purple-600 hover:underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
