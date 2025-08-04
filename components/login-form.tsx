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
import { CheckCircle2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
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
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
          <br />
          <span className="text-xs text-gray-400">(Try employer@unison.ai or employee@unison.ai)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              disabled={isPending}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {state && !state.success && state.message && (
            <ErrorDisplay 
              error={state.message}
              variant="card"
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">{/* Remember me checkbox can go here */}</div>
            <Link href="#" className="text-sm font-medium text-purple-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || (isFormSubmitted && !isValid)}
          >
            <LoadingButton isLoading={isPending} loadingText="Logging in...">
              Login
            </LoadingButton>
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-purple-600 hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}