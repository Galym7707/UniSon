'use client'

import { useState, useEffect } from 'react'
import EmployerNavbar from './EmployerNavbar'
import JobSeekerNavbar from './JobSeekerNavbar'
import { clientAuth, UserProfile } from '@/lib/auth-helpers-client'

interface RoleBasedNavigationProps {
  className?: string
}

export default function RoleBasedNavigation({ className }: RoleBasedNavigationProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { profile, error } = await clientAuth.getUserProfile()
        
        if (!error && profile) {
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error checking user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserRole()
  }, [])

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    return null
  }

  // No navigation for unauthenticated users
  if (!userProfile) {
    return null
  }

  // Render appropriate navbar based on user role
  if (userProfile.role === 'employer' || userProfile.role === 'admin') {
    return <EmployerNavbar userProfile={userProfile} className={className} />
  }

  if (userProfile.role === 'job-seeker') {
    return <JobSeekerNavbar userProfile={userProfile} className={className} />
  }

  // Default: no navigation for unknown roles
  return null
}