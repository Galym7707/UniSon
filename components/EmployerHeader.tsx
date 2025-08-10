'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, Building2, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'

interface EmployerHeaderProps {
  userEmail?: string
  userName?: string
  userRole?: string
  companyName?: string
  isAuthenticated?: boolean
  className?: string
}

export default function EmployerHeader({
  userEmail,
  userName,
  userRole,
  companyName,
  isAuthenticated,
  className = ''
}: EmployerHeaderProps) {
  const [user, setUser] = useState<{
    email: string
    name: string
    role?: string
  } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated !== undefined && userEmail && userName) {
      setUser({ 
        email: userEmail, 
        name: userName,
        role: userRole
      })
      return
    }

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Try to get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, name, role')
            .eq('id', session.user.id)
            .maybeSingle()

          let displayName = 'User'
          if (profile?.name?.trim()) {
            displayName = profile.name.trim()
          } else if (profile?.first_name?.trim()) {
            displayName = profile.first_name.trim()
          }

          setUser({
            email: session.user.email || '',
            name: displayName,
            role: profile?.role
          })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }

    checkAuth()
  }, [isAuthenticated, userEmail, userName, userRole])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      setUser(null)
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

  const quickActions = [
    {
      href: '/employer/jobs/new',
      icon: Briefcase,
      label: 'Post Job',
      className: 'text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20'
    },
    {
      href: '/employer/candidates',
      icon: Users,
      label: 'Find Talent',
      className: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    }
  ]

  // If user is not authenticated, don't render the header
  if (!user) {
    return null
  }

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Company Info */}
          <div className="flex items-center space-x-4">
            <Link href="/employer/dashboard" className="flex items-center">
              <Building2 className="h-8 w-8 text-[#FF7A00] mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#0A2540]">
                  Unison AI
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Employer Portal
                </span>
              </div>
            </Link>
            {companyName && (
              <div className="hidden sm:block border-l border-gray-300 pl-4">
                <div className="text-sm font-medium text-gray-900">{companyName}</div>
                <div className="text-xs text-gray-500">Hiring Dashboard</div>
              </div>
            )}
          </div>

          {/* Desktop Actions & User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center ${action.className}`}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  {user.role && (
                    <Badge variant="secondary" className="text-xs mr-1">
                      {user.role}
                    </Badge>
                  )}
                  Employer
                </div>
              </div>
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
                    <div className="flex items-center">
                      <Building2 className="h-6 w-6 text-[#FF7A00] mr-2" />
                      <div>
                        <span className="font-bold text-lg text-[#0A2540]">
                          Unison AI
                        </span>
                        <div className="text-xs text-gray-500">Employer Portal</div>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="p-4 border-b bg-gradient-to-r from-[#FF7A00]/5 to-orange-50">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.email}
                    </div>
                    {companyName && (
                      <div className="text-xs text-gray-500 mt-1">
                        {companyName}
                      </div>
                    )}
                    <div className="flex items-center mt-2">
                      {user.role && (
                        <Badge variant="secondary" className="text-xs mr-1">
                          {user.role}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Employer
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 border-b">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Quick Actions
                    </div>
                    <div className="space-y-2">
                      {quickActions.map((action) => (
                        <Link key={action.href} href={action.href}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${action.className}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <action.icon className="h-4 w-4 mr-3" />
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>

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
      </div>
    </header>
  )
}