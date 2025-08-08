'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/browser'
import { useAuthState } from '@/lib/supabase/hooks'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Profile {
  id: string
  first_name?: string
  last_name?: string
  name?: string
  profile_image_url?: string
  role?: string
}

export function UserProfileHeader() {
  const { user, loading } = useAuthState()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        return
      }

      setProfileLoading(true)
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, name, profile_image_url, role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        setProfile(profileData)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  // Don't render anything while auth is loading
  if (loading) {
    return null
  }

  // Don't render if no user
  if (!user) {
    return null
  }

  // Get display name
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) return profile.first_name
    if (profile?.last_name) return profile.last_name
    if (profile?.name) return profile.name
    return user.email || 'User'
  }

  // Determine profile path based on role
  const getProfilePath = () => {
    if (profile?.role === 'employer') {
      return '/employer/profile'
    }
    return '/job-seeker/profile'
  }

  const profilePath = getProfilePath()

  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      const first = profile?.first_name?.[0] || ''
      const last = profile?.last_name?.[0] || ''
      return (first + last).toUpperCase()
    }
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={profilePath}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.profile_image_url || undefined} />
          <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {profileLoading ? 'Loading...' : getDisplayName()}
          </div>
          {profile?.role && (
            <div className="text-xs text-gray-500 capitalize">
              {profile.role.replace('-', ' ')}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}