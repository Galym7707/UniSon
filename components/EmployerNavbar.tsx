'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

const navigationItems = [
  {
    href: '/employer/dashboard',
    icon: LayoutDashboard,
    text: 'Dashboard',
    key: 'dashboard'
  },
  {
    href: '/employer/jobs',
    icon: Briefcase,
    text: 'Jobs',
    key: 'jobs'
  },
  {
    href: '/employer/company',
    icon: Building2,
    text: 'Company',
    key: 'company'
  },
  {
    href: '/employer/candidates',
    icon: Users,
    text: 'Candidates',
    key: 'candidates'
  },
  {
    href: '/employer/settings',
    icon: Settings,
    text: 'Settings',
    key: 'settings'
  }
]

interface EmployerNavbarProps {
  userEmail?: string
  userName?: string
  companyName?: string
  userRole?: string
  isAuthenticated?: boolean
  className?: string
}

export default function EmployerNavbar({
  userEmail,
  userName,
  companyName,
  userRole,
  isAuthenticated,
  className = ''
}: EmployerNavbarProps) {
  const [user, setUser] = useState<{
    email: string
    name: string
    role?: string
    companyName?: string
  } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated !== undefined && userEmail && userName) {
      setUser({ 
        email: userEmail, 
        name: userName,
        role: userRole,
        companyName: companyName
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
            .select('first_name, last_name, name, role, company_name')
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
            role: profile?.role,
            companyName: profile?.company_name
          })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }

    checkAuth()
  }, [isAuthenticated, userEmail, userName, userRole, companyName])

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

  const handleAccountRedirect = () => {
    router.push('/employer/profile')
    setMobileMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (pathname === href) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  // If user is not authenticated, don't render the navbar
  if (!user) {
    return null
  }

  return (
    <nav className={`bg-white border-b shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/employer/dashboard" className="flex items-center">
              <span className="font-bold text-xl text-[#0A2540]">
                Unison AI
              </span>
              <span className="ml-2 text-sm text-gray-600 font-medium">
                Employer
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'text-[#00C49A] bg-[#00C49A]/10'
                      : 'text-gray-700 hover:text-[#00C49A] hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${active ? 'text-[#00C49A]' : 'text-gray-500'}`} />
                  {item.text}
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAccountRedirect}
                className="flex items-center text-gray-700 hover:text-[#00C49A]"
              >
                <User className="h-4 w-4 mr-2" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {user.companyName || 'Employer'}
                    {user.role && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
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
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-left">
                      <span className="font-bold text-lg text-[#0A2540]">
                        Unison AI
                      </span>
                      <span className="block text-sm text-gray-600 font-medium">
                        Employer Portal
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  {/* User Info */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.companyName || 'Employer Dashboard'}
                      {user.role && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-4">
                    <div className="space-y-1 px-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        
                        return (
                          <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                              active
                                ? 'bg-[#00C49A] text-white shadow-sm'
                                : 'text-gray-700 hover:text-[#00C49A] hover:bg-gray-50'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mr-3 ${active ? 'text-white' : 'text-gray-500'}`} />
                            {item.text}
                          </Link>
                        )
                      })}
                    </div>
                  </nav>

                  {/* Mobile Account & Logout */}
                  <div className="p-4 border-t space-y-2">
                    <Button
                      variant="ghost"
                      onClick={handleAccountRedirect}
                      className="w-full flex items-center justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Account Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-start"
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