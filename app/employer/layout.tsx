'use client'

import React, { useEffect, useState } from 'react'
import EmployerSidebar from '@/components/EmployerSidebar'
import EmployerHeader from '@/components/EmployerHeader'
import { clientAuth, UserProfile } from '@/lib/auth-helpers-client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function EmployerSectionLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated and has employer access
        const { profile, error: authError } = await clientAuth.requireEmployerAccess()
        
        if (authError || !profile) {
          setError(authError || 'Unable to verify employer access')
          // Redirect to unauthorized page or login
          router.push('/auth/login?message=employer_access_required')
          toast({
            title: 'Access Required',
            description: 'You need employer privileges to access this section.',
            variant: 'destructive'
          })
          return
        }

        setUserProfile(profile)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load user profile')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router, toast])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Employer Header */}
      <EmployerHeader userProfile={userProfile || undefined} />
      
      {/* Employer fixed sidebar */}
      <EmployerSidebar />
      
      {/* Content area with left offset for sidebar and top offset for header */}
      <div className="ml-64 pt-16 p-6">
        {children}
      </div>
    </div>
  )
}