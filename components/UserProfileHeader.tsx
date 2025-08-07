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

      try {
        setProfileLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_image_url, role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  // Don't render anything if not authenticated or still loading
  if (loading || !user) {
    return null
  }

  const displayName = 
    (profile?.first_name && profile?.last_name ? 
      `${profile.first_name} ${profile.last_name}` : 
      profile?.first_name || 
      profile?.last_name || 
      'User')

  const profilePath = profile?.role === 'employer' ? '/employer/profile' : '/job-seeker/profile'

  // Generate initials from first_name and last_name
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
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage 
            src={profile?.profile_image_url || ''} 
            alt={`${displayName}'s profile`}
          />
          <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium text-gray-700 hover:text-black transition-colors">
          {displayName}
        </span>
      </Link>
    </div>
  )
}