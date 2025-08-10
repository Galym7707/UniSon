'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'
import { UserProfile } from '@/lib/auth-helpers'

interface EmployerHeaderProps {
  userProfile?: UserProfile
}

export default function EmployerHeader({ userProfile }: EmployerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100" role="banner">
      <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/employer/dashboard" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded">
          <Image
            src="/LOGO2(1).png"
            alt="UnisonAI logo"
            width={140}
            height={40}
            className="h-8 sm:h-10 w-auto"
            priority
          />
          <div className="hidden sm:block">
            <div className="text-xs text-gray-500">Employer Portal</div>
          </div>
        </Link>

        {/* Desktop User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {userProfile && (
            <div className="text-sm text-gray-600">
              <span>Welcome, {userProfile.name || userProfile.email}</span>
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
        <div className="lg:hidden">
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
                  <span className="text-xs text-gray-500">Employer</span>
                </div>

                {/* User Info */}
                {userProfile && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile.name || userProfile.email}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {userProfile.email}
                    </div>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {userProfile.role}
                    </Badge>
                  </div>
                )}

                {/* Mobile Logout */}
                <div className="p-4 border-t mt-auto">
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
    </header>
  )
}