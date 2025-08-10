"use client"

import { AlertTriangle, RefreshCw, Home, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ErrorFallbackProps {
  error: Error
  reset: () => void
  isHydrationError?: boolean
}

export function ErrorFallback({ error, reset, isHydrationError }: ErrorFallbackProps) {
  const isHydration = isHydrationError ?? false

  if (isHydration) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-orange-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl text-orange-900">Loading Issue Detected</CardTitle>
            <CardDescription>
              The page is experiencing a temporary display issue. This usually resolves automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                Hydration Error
              </Badge>
            </div>
            
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Technical details
              </summary>
              <div className="mt-2 rounded bg-orange-50 p-2 font-mono text-xs text-orange-800">
                {error.message}
              </div>
            </details>
            
            <div className="flex gap-2">
              <Button onClick={reset} className="flex-1" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Hard Refresh
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              If this issue persists, try disabling browser extensions or clearing your browser cache.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. This has been logged for investigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Technical details
            </summary>
            <div className="mt-2 rounded bg-gray-50 p-2 font-mono text-xs text-gray-700">
              {error.message}
            </div>
          </details>
          
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error boundary implementation
import { createErrorBoundary } from "@/lib/error-handling"

const ErrorBoundaryWrapper = createErrorBoundary(ErrorFallback)

// Global error boundary wrapper
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      {children}
    </ErrorBoundaryWrapper>
  )
}