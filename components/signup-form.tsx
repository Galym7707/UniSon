"use client"

import { useActionState, useState, useEffect } from "react"
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

// --------------
// Типы и схемы
// --------------

/** Возможные роли пользователя */
export type Role = "employer" | "job-seeker"

// пароль: ≥ 8 символов, 1 верхний, 1 нижний регистр, цифра
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

const baseSchema = z.object({
  role: z.enum(["employer", "job-seeker"]),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Full name can only contain letters, spaces, apostrophes, and hyphens"),
  email: z.string().email("Please enter a valid email address").max(255),
  password: z.string().regex(passwordRegex, {
    message: "Password must be at least 8 characters and include upper‑ & lowercase letters and a number",
  }),
})

const signupSchema = baseSchema
  .extend({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be less than 100 characters")
      .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters")
      .optional(),
  })
  .refine(
    (data) => (data.role === "employer" ? !!data.companyName : true),
    {
      message: "Company name is required for employers",
      path: ["companyName"],
    },
  )

export type SignupFormData = z.infer<typeof signupSchema>

// --------------------------
// Компонент формы регистрации
// --------------------------
export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null)
  const [role, setRole] = useState<Role>("employer")
  const [submitted, setSubmitted] = useState(false)

  // react‑hook‑form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { role: "employer" },
  })

  // следим за значением из формы, чтобы schema не расходилась
  const watchedRole = watch("role")

  // перенаправление после успешной регистрации
  useEffect(() => {
    if (!state?.success) return

    const url = role === "employer" ? "/employer/dashboard" : "/job-seeker/dashboard"
    const timer = setTimeout(() => (window.location.href = url), 1200)
    return () => clearTimeout(timer)
  }, [state, role])

  // ---------------- handlers ----------------
  const onSubmit = (data: SignupFormData) => {
    setSubmitted(true)
    clearErrors()

    const fd = new FormData()
    fd.append("role", data.role)
    fd.append("fullName", data.fullName)
    fd.append("email", data.email)
    fd.append("password", data.password)
    if (data.companyName) fd.append("companyName", data.companyName)

    formAction(fd)
  }

  const handleRolePick = (picked: Role) => !isPending && setRole(picked)

  // ---------------- UI helpers ----------------
  const EmployerExtraFields = (
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

  const JobSeekerExtraFields = (
    <div>
      <Label htmlFor="fullName">Full Name</Label>
      <Input id="fullName" placeholder="Jane Smith" disabled={isPending} {...register("fullName")} />
      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
    </div>
  )

  // ---------------- Render ----------------
  if (state?.success) {
    return (
      <Card>
        <CardHeader className="text-center space-y-2">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="text-2xl">Success!</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full mt-4">
            <Link href="/">Continue</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Select your role to start using Unison AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* скрытое поле роли, чтобы react-hook-form видел актуальное значение */}
          <input type="hidden" value={role} {...register("role")} />

          {/* ---- выбор роли ---- */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Employer */}
            <div
              onClick={() => handleRolePick("employer")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-gray-50",
                role === "employer" ? "border-purple-500 bg-purple-50" : "border-gray-200",
                isPending && "opacity-50 cursor-not-allowed",
              )}
            >
              {role === "employer" && <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-purple-600" />}
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <p className="font-semibold">Employer</p>
            </div>

            {/* Job‑seeker */}
            <div
              onClick={() => handleRolePick("job-seeker")}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-gray-50",
                role === "job-seeker" ? "border-purple-500 bg-purple-50" : "border-gray-200",
                isPending && "opacity-50 cursor-not-allowed",
              )}
            >
              {role === "job-seeker" && <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-purple-600" />}
              <User className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <p className="font-semibold">Job seeker</p>
            </div>
          </div>

          {/* ---- специфичные поля ---- */}
          {role === "employer" ? EmployerExtraFields : JobSeekerExtraFields}

          {/* ---- e‑mail ---- */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" disabled={isPending} {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* ---- пароль ---- */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" disabled={isPending} {...register("password")} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            <p className="text-xs text-gray-500 mt-1">At least 8 chars with upper/lowercase and a number</p>
          </div>

          {/* ---- ошибки ---- */}
          {state && !state.success && state.message && (
            <ErrorDisplay error={state.message} variant="card" />
          )}

          {/* ---- submit ---- */}
          <Button type="submit" className="w-full" disabled={isPending || (submitted && !isValid)}>
            <LoadingButton isLoading={isPending} loadingText="Creating…">
              Create account
            </LoadingButton>
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-purple-600 hover:underline">
            Log&nbsp;in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default SignupForm
