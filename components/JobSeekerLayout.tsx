'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Navbar from './Navbar'
import { Button } from './ui/button'
import { Menu, X, LayoutDashboard, User, Search, Heart, Settings, Building2 } from 'lucide-react'

interface JobSeekerLayoutProps {
  children: ReactNode
  userEmail?: string
  userName?: string
  isAuthenticated?: boolean
  className?: string
  showSidebar?: boolean
  sidebarContent?: ReactNode
}

const JobSeekerSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/job-seeker/dashboard', icon: LayoutDashboard },
    { name: 'Job Search', href: '/job-seeker/search', icon: Search },
    { name: 'Saved Jobs', href: '/job-seeker/saved', icon: Heart },
    { name: 'Profile', href: '/job-seeker/profile', icon: User },
    { name: 'Companies', href: '/job-seeker/companies', icon: Building2 },
    { name: 'Settings', href: '/job-seeker/settings', icon: Settings },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-20 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col min-h-0 px-4 py-4">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 px-4 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function JobSeekerLayout({
  children,
  userEmail,
  userName,
  isAuthenticated,
  className = '',
  showSidebar = true,
  sidebarContent
}: JobSeekerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  const pathname = usePathname()
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [sidebarOpen])

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Enhanced Navbar with Hamburger Menu */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar 
          userEmail={userEmail}
          userName={userName}
          isAuthenticated={isAuthenticated}
        />
        {showSidebar && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <JobSeekerSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? 'md:ml-64' : ''} ${showSidebar ? 'pt-24 md:pt-20' : 'pt-16'}`}>
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}