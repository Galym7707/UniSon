"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import Link from "next/link"
import { loginAction } from "@/app/auth/login/action"
import { CheckCircle2, Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  })

  useEffect(() => {
    if (state?.success) {
      // Wait a bit for cookies to be set, then redirect
      setTimeout(() => {
        router.push("/job-seeker/dashboard")
      }, 1000)
    }
  }, [state, router])

  const onSubmit = (data: LoginFormData) => {
    setIsFormSubmitted(true)
    clearErrors()
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    
    formAction(formData)
  }

  if (state?.success) {
    return (
      <Card role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
          <CardTitle className="text-2xl">Success!</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-600">Redirecting you to your dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Enter your credentials to access your account.
          <br />
          <span className="text-xs text-gray-400 mt-2 block">
            (Try employer@unison.ai or employee@unison.ai)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              disabled={isPending}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={errors.email ? "true" : "false"}
              className="focus:ring-2 focus:ring-black focus:border-black"
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                disabled={isPending}
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={errors.password ? "true" : "false"}
                className="focus:ring-2 focus:ring-black focus:border-black pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={isPending ? -1 : 0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {state && !state.success && state.message && (
            <div role="alert">
              <ErrorDisplay 
                error={state.message}
                variant="card"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {/* Remember me checkbox can go here */}
            </div>
            <Link 
              href="#" 
              className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 rounded"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors" 
            disabled={isPending || (isFormSubmitted && !isValid)}
            aria-describedby={isPending ? "login-status" : undefined}
          >
            <LoadingButton isLoading={isPending} loadingText="Logging in...">
              Sign in
            </LoadingButton>
          </Button>
          
          {isPending && (
            <p id="login-status" className="sr-only" aria-live="polite">
              Please wait, logging you in...
            </p>
          )}
        </form>
        
        <div className="mt-6 text-center text-sm border-t border-gray-200 pt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link 
              href="/auth/signup" 
              className="font-medium text-purple-600 hover:text-purple-800 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 rounded"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}