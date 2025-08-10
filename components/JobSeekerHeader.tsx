'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bell, Search, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'

interface JobSeekerHeaderProps {
  user?: {
    email: string
    name: string
  } | null
  onLogout?: () => void
}

export function JobSeekerHeader({ user, onLogout }: JobSeekerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      if (onLogout) {
        onLogout()
      }
      
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

  const navigationItems = [
    { href: '/job-seeker/dashboard', label: 'Dashboard' },
    { href: '/job-seeker/search', label: 'Find Jobs' },
    { href: '/job-seeker/saved', label: 'Saved Jobs' },
    { href: '/job-seeker/profile', label: 'Profile' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/job-seeker/dashboard" className="flex items-center gap-2">
          <Image
            src="/LOGO2(1).png"
            alt="UnisonAI logo"
            width={140}
            height={40}
            className="h-8 sm:h-10 w-auto"
            priority
          />
          <span className="hidden sm:block text-sm font-medium text-[#00C49A] bg-[#00C49A]/10 px-2 py-1 rounded">
            Job Seeker
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-[#00C49A] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Quick Search */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-[#00C49A]"
            onClick={() => router.push('/job-seeker/search')}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search Jobs</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-[#00C49A] relative"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#00C49A] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => router.push('/job-seeker/profile')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/job-seeker/settings')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-600 hover:text-[#00C49A] hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Signed in as {user.name}
                  </div>
                  <Link
                    href="/job-seeker/profile"
                    className="block px-3 py-2 text-gray-600 hover:text-[#00C49A] hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/job-seeker/settings"
                    className="block px-3 py-2 text-gray-600 hover:text-[#00C49A] hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-md font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}