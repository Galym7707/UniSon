// app/test-auth/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createBrowserClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        setUser(user)
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err)
        logError('test-auth-page', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      setError(null)
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('test-auth-signout', err)
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      {error && (
        <div className="mb-4">
          <ErrorDisplay 
            error={error}
            onDismiss={() => setError(null)}
            variant="card"
          />
        </div>
      )}
      
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <p>User ID: {user.id}</p>
          <button 
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4 hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <a href="/auth/login" className="text-blue-500 underline">
            Go to login
          </a>
        </div>
      )}
    </div>
  )
}