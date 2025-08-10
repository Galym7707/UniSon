'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings, FileText } from 'lucide-react'
import { useAuthState } from '@/lib/supabase/hooks'
import { createBrowserClient } from '@/lib/supabase/browser'

interface Profile {
  id: string
  role?: string
}

export function UserProfileHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const { user } = useAuthState()
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
          .select('id, role')
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

  // Determine profile path based on role
  const getProfilePath = () => {
    if (!profile || profileLoading) {
      // Default to job-seeker during loading or if no profile
      return '/job-seeker/profile'
    }
    
    if (profile.role === 'employer') {
      return '/employer/company'  // Use /employer/company for employers to match upstream changes
    }
    return '/job-seeker/profile'
  }

  // Determine dashboard path based on role  
  const getDashboardPath = () => {
    if (!profile || profileLoading) {
      return '/job-seeker/dashboard'
    }
    
    if (profile.role === 'employer') {
      return '/employer/dashboard'
    }
    return '/job-seeker/dashboard'
  }

  // Determine settings path based on role
  const getSettingsPath = () => {
    if (!profile || profileLoading) {
      return '/job-seeker/settings'
    }
    
    if (profile.role === 'employer') {
      return '/employer/settings'
    }
    return '/job-seeker/settings'
  }

  if (!user) return null

  // Extract user's initials from first_name/last_name or fallback to email
  const getInitials = () => {
    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase()
    } else if (firstName) {
      return firstName.slice(0, 2).toUpperCase()
    } else if (lastName) {
      return lastName.slice(0, 2).toUpperCase()
    }
    // Fallback to old name fields for backward compatibility
    const name = user.user_metadata?.name || user.user_metadata?.full_name
    if (name) {
      return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user.email?.slice(0, 2).toUpperCase() || 'U'
  }

  // Get display name with proper null/undefined handling
  const getDisplayName = () => {
    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }
    // Fallback to old name fields for backward compatibility
    const name = user.user_metadata?.name || user.user_metadata?.full_name
    if (name) {
      return name
    }
    return user.email?.split('@')[0] || 'User'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        aria-label="User profile menu"
        aria-expanded={dropdownOpen}
      >
        {/* Profile Image or Initials */}
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile picture"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>

        {/* User Name */}
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {getDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <nav className="py-1">
            <Link
              href={getProfilePath()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="w-4 h-4" />
              View Profile
            </Link>

            <Link
              href={getDashboardPath()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <FileText className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href={getSettingsPath()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <hr className="my-1" />

            <Link
              href="/auth/logout"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </nav>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  )
}