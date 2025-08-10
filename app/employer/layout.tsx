'use client'

import React, { useEffect, useState } from 'react'
import EmployerSidebar from '@/components/EmployerSidebar'
import EmployerHeader from '@/components/EmployerHeader'
import { clientAuth, UserProfile } from '@/lib/auth-helpers-client'

export default function EmployerSectionLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      const { profile } = await clientAuth.getUserProfile()
      if (profile) {
        setUserProfile(profile)
      }
    }

    loadUserProfile()
  }, [])

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