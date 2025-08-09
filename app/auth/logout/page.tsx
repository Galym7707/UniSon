'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { CheckCircle2, LogOut } from 'lucide-react'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import Link from 'next/link'

interface LogoutState {
  isLoading: boolean
  success: boolean
  error: string | null
}

export default function LogoutPage() {
  const [state, setState] = useState<LogoutState>({
    isLoading: false,
    success: false,
    error: null
  })
  const router = useRouter()

  const handleLogout = async () => {
    setState({ isLoading: true, success: false, error: null })

    try {
      const supabase = getSupabaseBrowser()
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        const structuredError = logError('logout-page', error, {
          attemptedAt: new Date().toISOString()
        })
        setState({
          isLoading: false,
          success: false,
          error: getUserFriendlyErrorMessage(error)
        })
        return
      }

      // Successful logout
      setState({ isLoading: false, success: true, error: null })
      
      // Wait a moment for state cleanup, then redirect
      setTimeout(() => {
        router.push('/')
      }, 1500)

    } catch (error) {
      const structuredError = logError('logout-page', error)
      setState({
        isLoading: false,
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      })
    }
  }

  // Auto-logout on page load
  useEffect(() => {
    handleLogout()
  }, [])

  if (state.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <Card role="status" aria-live="polite">
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
              <CardTitle className="text-2xl">Signed out successfully</CardTitle>
              <CardDescription>You have been logged out of your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-gray-600">Redirecting you to the home page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <CardHeader className="text-center">
            <LogOut className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
            <CardTitle className="text-2xl">Sign out</CardTitle>
            <CardDescription>
              {state.isLoading ? 'Signing you out...' : 'Confirm you want to sign out of your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.error && (
              <div role="alert">
                <ErrorDisplay error={state.error} variant="card" />
              </div>
            )}
            
            {!state.isLoading && state.error && (
              <div className="space-y-2">
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors"
                >
                  Try again
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            )}

            {state.isLoading && (
              <div className="text-center">
                <LoadingButton isLoading={true} loadingText="Signing out...">
                  Signing out...
                </LoadingButton>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}