"use client"

import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Progress,
} from "@/components/ui"

import {
  LayoutDashboard, User, Search, Heart, Settings, TrendingUp, Bell, Star, Building2, MapPin, Calendar, Users, Brain,
} from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/browser"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"

const SidebarLink = ({ href, icon, children, pathname }: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  pathname: string
}) => {
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
        isActive 
          ? 'font-medium text-purple-600 bg-purple-50' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="h-4 w-4">{icon}</div>
      {children}
    </Link>
  )
}

export default function DashboardPage() {
  const supabase = createBrowserClient()
  const pathname = usePathname()

  /* ─────── state ─────── */
  const [profilePct, setProfilePct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* ─────── effects ─────── */
  useEffect(() => {
    const calculateProfileCompleteness = () => {
      // Mock calculation for now
      setProfilePct(35)
      setLoading(false)
    }

    calculateProfileCompleteness()
  }, [])

  /* ─────── loading/error states ─────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorDisplay error={error} />
      </div>
    )
  }

  /* ─────── render ─────── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out
          flex flex-col pt-16 lg:pt-0
        `}>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink href="/job-seeker/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} pathname={pathname}>
              Dashboard
            </SidebarLink>
            
            <SidebarLink href="/job-seeker/profile" icon={<User className="h-4 w-4" />} pathname={pathname}>
              Profile
            </SidebarLink>
            
            <SidebarLink href="/job-seeker/assessment" icon={<Brain className="h-4 w-4" />} pathname={pathname}>
              AI Assessment
            </SidebarLink>
            
            <SidebarLink href="/job-seeker/jobs" icon={<Search className="h-4 w-4" />} pathname={pathname}>
              Find Jobs
            </SidebarLink>
            
            <SidebarLink href="/job-seeker/saved" icon={<Heart className="h-4 w-4" />} pathname={pathname}>
              Saved Jobs
            </SidebarLink>
            
            <SidebarLink href="/job-seeker/settings" icon={<Settings className="h-4 w-4" />} pathname={pathname}>
              Settings
            </SidebarLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white p-6">
              <h1 className="text-2xl font-bold mb-2">Welcome to Your Job Search Dashboard</h1>
              <p className="text-purple-100">Find your perfect job match with AI-powered recommendations</p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-md">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Take AI Assessment</h3>
                      <p className="text-sm text-gray-600">Get personalized job matches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-md">
                      <Search className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Browse Jobs</h3>
                      <p className="text-sm text-gray-600">Explore new opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-md">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Update Profile</h3>
                      <p className="text-sm text-gray-600">Complete your information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile completion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile completeness</span>
                    <span>{profilePct}%</span>
                  </div>
                  <Progress value={profilePct} className="h-2" />
                  <p className="text-sm text-gray-600">
                    Complete your profile to get better job recommendations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recommended Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-2 border-purple-200 pl-3">
                      <h4 className="font-medium">Software Engineer</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        Tech Corp
                        <MapPin className="h-3 w-3 ml-2" />
                        San Francisco
                      </div>
                    </div>
                    <div className="border-l-2 border-purple-200 pl-3">
                      <h4 className="font-medium">Product Designer</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        Design Studio
                        <MapPin className="h-3 w-3 ml-2" />
                        Remote
                      </div>
                    </div>
                    <div className="border-l-2 border-purple-200 pl-3">
                      <h4 className="font-medium">Data Analyst</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        Analytics Inc
                        <MapPin className="h-3 w-3 ml-2" />
                        New York
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-green-50 rounded-full">
                        <Calendar className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Profile updated</p>
                        <p className="text-gray-600">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-blue-50 rounded-full">
                        <Users className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Job application sent</p>
                        <p className="text-gray-600">5 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-purple-50 rounded-full">
                        <Star className="h-3 w-3 text-purple-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Assessment completed</p>
                        <p className="text-gray-600">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}