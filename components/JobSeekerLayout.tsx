'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Brain,
  Search,
  Heart,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  pathname: string
  onClick?: () => void
}

const SidebarLink = ({ href, icon, children, pathname, onClick }: SidebarLinkProps) => {
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg ${
        isActive 
          ? 'text-[#00C49A] bg-[#00C49A]/10' 
          : 'text-[#333333] hover:bg-gray-100'
      }`}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      {children}
    </Link>
  )
}

const navigationItems = [
  {
    href: '/job-seeker/dashboard',
    icon: <LayoutDashboard />,
    label: 'Dashboard'
  },
  {
    href: '/job-seeker/profile',
    icon: <User />,
    label: 'Profile'
  },
  {
    href: '/job-seeker/test',
    icon: <Brain />,
    label: 'Test'
  },
  {
    href: '/job-seeker/jobs',
    icon: <Search />,
    label: 'Browse Jobs'
  },
  {
    href: '/job-seeker/search',
    icon: <Search />,
    label: 'Job Search'
  },
  {
    href: '/job-seeker/saved',
    icon: <Heart />,
    label: 'Saved'
  },
  {
    href: '/job-seeker/settings',
    icon: <Settings />,
    label: 'Settings'
  }
]

interface JobSeekerLayoutProps {
  children: React.ReactNode
}

export default function JobSeekerLayout({ children }: JobSeekerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-white shadow-sm border-r transition-transform duration-200 ease-in-out
          pt-16 lg:pt-0
        `}>
          <div className="p-6">
            <Link href="/" className="text-xl font-bold text-[#0A2540]">
              Unison AI
            </Link>
          </div>
          <nav className="px-4 space-y-2">
            {navigationItems.map((item) => (
              <SidebarLink 
                key={item.href}
                href={item.href} 
                icon={item.icon} 
                pathname={pathname}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </SidebarLink>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile menu button */}
          <div className="lg:hidden p-4">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="sm"
              className="p-2"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Page content */}
          <div className="p-8 lg:pt-8">
            {children}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}