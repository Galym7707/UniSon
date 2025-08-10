'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Brain,
  Search,
  Settings,
  LogOut,
  Menu,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'
import { UserProfile } from '@/lib/auth-helpers-client'

interface JobSeekerNavbarProps {
  userProfile?: UserProfile
  className?: string
}

const navigationItems = [
  {
    href: '/job-seeker/dashboard',
    icon: LayoutDashboard,
    text: 'Dashboard',
    key: 'dashboard'
  },
  {
    href: '/job-seeker/profile',
    icon: User,
    text: 'Profile',
    key: 'profile'
  },
  {
    href: '/job-seeker/search',
    icon: Search,
    text: 'Browse Jobs',
    key: 'search'
  },
  {
    href: '/job-seeker/saved',
    icon: Heart,
    text: 'Saved Jobs',
    key: 'saved'
  },
  {
    href: '/job-seeker/results',
    icon: Brain,
    text: 'Test Results',
    key: 'results'
  }
]

export default function JobSeekerNavbar({ userProfile, className = '' }: JobSeekerNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const isActive = (href: string) => {
    // Handle special case for /job-seeker/jobs route when on /job-seeker/search
    if (href === '/job-seeker/search') {
      return pathname === href || pathname === '/job-seeker/jobs'
    }
    
    // Handle exact matches
    if (pathname === href) return true
    
    // Handle nested routes
    if (pathname.startsWith(href + '/')) return true
    
    return false
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      setMobileMenuOpen(false)
      router.push('/')
      
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of your account.'
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing you out. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <nav className={`bg-white border-b shadow-sm sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/job-seeker/dashboard" className="flex items-center">
              <span className="font-bold text-xl text-[#0A2540]">
                Unison AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#00C49A] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.text}
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {userProfile && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium text-gray-900">{userProfile.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {userProfile.role}
                </Badge>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <span className="font-bold text-lg text-[#0A2540]">
                      Unison AI
                    </span>
                  </div>

                  {/* User Info */}
                  {userProfile && (
                    <div className="p-4 border-b bg-gray-50">
                      <div className="text-sm font-medium text-gray-900">
                        {userProfile.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {userProfile.email}
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {userProfile.role}
                      </Badge>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-4 space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? 'bg-[#00C49A] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.text}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Mobile Logout */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}