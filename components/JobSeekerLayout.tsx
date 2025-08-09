'use client'

import { ReactNode, useState, useEffect } from 'react'
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
  X,
  Heart,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { useToast } from '@/hooks/use-toast'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

interface JobSeekerLayoutProps {
  children: ReactNode
  userEmail?: string
  userName?: string
  isAuthenticated?: boolean
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
    text: 'Browse & Search Jobs',
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
  },
  {
    href: '/job-seeker/settings',
    icon: Settings,
    text: 'Settings',
    key: 'settings'
  }
]

export default function JobSeekerLayout({
  children,
  userEmail,
  userName,
  isAuthenticated,
  className = ''
}: JobSeekerLayoutProps) {
  const [user, setUser] = useState<{
    email: string
    name: string
  } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated !== undefined && userEmail && userName) {
      setUser({ email: userEmail, name: userName })
      return
    }

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, name')
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
            name: displayName
          })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }

    checkAuth()
  }, [isAuthenticated, userEmail, userName])

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      setUser(null)
      setSidebarOpen(false)
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

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'bg-white' : 'bg-gray-50 border-r border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Link href="/job-seeker/dashboard" className="flex items-center">
          <span className="font-bold text-xl text-[#0A2540]">
            Unison AI
          </span>
        </Link>
        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {/* User Info */}
      {user && !sidebarCollapsed && (
        <div className="p-4 border-b bg-white">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {user.email}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#00C49A] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              title={sidebarCollapsed ? item.text : undefined}
            >
              <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && item.text}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`${sidebarCollapsed ? 'px-2' : 'w-full'} flex items-center justify-center`}
        >
          <LogOut className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
          {!sidebarCollapsed && 'Sign out'}
        </Button>
      </div>
    </div>
  )

  // If user is not authenticated, render children without layout
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}>
          <div className="w-full">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="default" size="lg" className="rounded-full shadow-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}