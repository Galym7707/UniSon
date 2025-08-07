'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { useAuthState } from '@/lib/supabase/hooks'

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

      try {
        setProfileLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, name, profile_image_url, role')
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

  const displayName = profile?.name || 
    (profile?.first_name && profile?.last_name ? 
      `${profile.first_name} ${profile.last_name}` : 
      profile?.first_name || 
      profile?.last_name || 
      'User')

  const profilePath = profile?.role === 'employer' ? '/employer/profile' : '/job-seeker/profile'

  return (
    <div className="flex items-center gap-3">
      <Link
        href={profilePath}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {profile?.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={`${displayName}'s profile`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <User 
            className={`w-5 h-5 text-gray-500 ${profile?.profile_image_url ? 'hidden' : ''}`}
          />
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700 hover:text-black transition-colors">
          {displayName}
        </span>
      </Link>
    </div>
  )
}