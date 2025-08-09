//app/auth/employer/register/page.tsx

"use client"

import { useActionState, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Building2 } from "lucide-react"
import { signupAction } from "@/actions/auth"

// Validation schema for employer registration
const employerSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s'.,&-]+$/, "Company name contains invalid characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
})

type EmployerFormData = z.infer<typeof employerSchema>

export default function EmployerRegister() {
  const [state, formAction, isPending] = useActionState(signupAction, null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    mode: "onBlur",
  })

  const onSubmit = (data: EmployerFormData) => {
    clearErrors()

    const formData = new FormData()
    formData.append("role", "employer")
    formData.append("companyName", data.companyName.trim())
    formData.append("email", data.email.trim().toLowerCase())
    formData.append("password", data.password)

    formAction(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="text-center p-8">
            <Building2 className="w-32 h-32 text-[#FF7A00] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#0A2540] mb-4">Grow with the best talent</h2>
            <p className="text-[#333333] text-lg">
              Find ideal candidates with AI-powered personality and skills analysis
            </p>
          </div>
        </div>

        <div>
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-[#0A2540]">
              Unison AI
            </Link>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-[#0A2540]">Company Registration</CardTitle>
              <CardDescription className="text-[#333333]">Start finding the best candidates</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-[#333333] font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Your Company Inc."
                    disabled={isPending}
                    {...register("companyName")}
                    className={errors.companyName ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#333333] font-medium">
                    Work Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hr@company.com"
                    disabled={isPending}
                    {...register("email")}
                    className={errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#333333] font-medium">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={isPending}
                    {...register("password")}
                    className={errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Server-side error */}
                {state?.error && <ErrorDisplay error={state.error} variant="card" />}

                <Button 
                  type="submit" 
                  className="w-full bg-[#FF7A00] hover:bg-[#E66A00] text-white font-semibold py-3"
                  disabled={isPending}
                >
                  <LoadingButton isLoading={isPending} loadingText="Creating Account…">
                    Create Company Account
                  </LoadingButton>
                </Button>
              </form>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-[#333333] hover:text-[#FF7A00]">
                  Already registered? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}