"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Progress,
  LayoutDashboard, User, Search, Heart, Settings, TrendingUp, Bell, Star, Building2, MapPin, Calendar, Users, Brain,
} from "@/components/ui"

import { createBrowserClient } from "@/lib/supabase/browser"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  const supabase = createBrowserClient()

  /* ─────── state ─────── */
  const [profilePct, setProfilePct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState<string>('Friend')

  /* --- load profile --- */
  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)

        /** 1️⃣  отлавливаем всякие ошибки: No JWT token, etc. */
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr) throw sessionErr
        if (!session?.user) throw new Error("No authenticated user found")

        /** 2️⃣  профиль гарантированно создан в момент signup → PGRST116 исчезнет */
        const { data, error: profileErr } = await supabase
          .from("profiles")
          .select("first_name,last_name,title,summary,experience,skills")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileErr) throw profileErr

        if (isMounted && data) {
          const filled = Object.values(data).filter((v) => v && v !== "").length
          setProfilePct(Math.round((filled / 6) * 100))
          
          // Set user name with fallback logic for first_name and last_name
          const firstName = data.first_name?.trim()
          const lastName = data.last_name?.trim()
          
          if (firstName && lastName) {
            setUserName(`${firstName} ${lastName}`)
          } else if (firstName) {
            setUserName(firstName)
          } else if (lastName) {
            setUserName(lastName)
          }
          // If none are available, keep default "Friend"
        }
      } catch (err) {
        if (isMounted) {
          const message = getUserFriendlyErrorMessage(err)
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [supabase])

  const retry = () => {
    setError(null)
    window.location.reload()
  }

  /* ──────────────── loading / error states ──────────────── */
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="flex">
            {/* Sidebar skeleton */}
            <aside className="w-64 bg-white border-r shadow-sm">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <nav className="px-4 space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center px-4 py-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main content skeleton */}
            <main className="flex-1 p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full">
            <ErrorDisplay
              error={error}
              onRetry={retry}
              variant="card"
            />
          </div>
        </div>
        <Footer />
      </>
    )
  }

  /* ──────────────── main UI ──────────────── */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* ========== SIDEBAR ========== */}
          <aside className="w-64 bg-white border-r shadow-sm">
            <div className="p-6 font-bold text-xl text-[#0A2540]">Unison AI</div>

            <nav className="px-4 space-y-2">
              <SidebarLink href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" active />
              <SidebarLink href="/job-seeker/profile"   icon={User}            text="Profile" />
              <SidebarLink href="/job-seeker/test"      icon={Brain}           text="Test" />
              <SidebarLink href="/job-seeker/search"    icon={Search}          text="Job search" />
              <SidebarLink href="/job-seeker/saved"     icon={Heart}           text="Saved" />
              <SidebarLink href="/job-seeker/settings"  icon={Settings}        text="Settings" />
            </nav>
          </aside>

          {/* ========== MAIN CONTENT ========== */}
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-[#0A2540] mb-6">
              Welcome back, {userName}!
            </h1>

            {/* ========== STATS OVERVIEW ========== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Profile Completeness"
                value={`${profilePct}%`}
                icon={User}
                color="text-[#00C49A]"
              >
                <div className="mt-2">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                      <span className="ml-3 text-gray-600">Loading profile data...</span>
                    </div>
                  ) : error ? (
                    <ErrorDisplay error={error} onRetry={retry} variant="card" />
                  ) : (
                    <Progress value={profilePct} className="w-full" />
                  )}
                </div>
              </StatsCard>

              <StatsCard
                title="Job Applications"
                value="0"
                icon={Building2}
                color="text-[#FF7A00]"
              >
                <p className="text-sm text-gray-600 mt-2">Start applying to jobs</p>
              </StatsCard>

              <StatsCard
                title="Profile Views"
                value="0"
                icon={TrendingUp}
                color="text-[#0A2540]"
              >
                <p className="text-sm text-gray-600 mt-2">Complete your profile</p>
              </StatsCard>
            </div>

            {/* ========== RECENT ACTIVITY & QUICK ACTIONS ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0A2540]">
                    <Star className="w-5 h-5 text-[#FF7A00]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/job-seeker/profile">
                    <Button variant="outline" className="w-full justify-start hover:bg-[#00C49A]/10">
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile ({profilePct}%)
                    </Button>
                  </Link>
                  <Link href="/job-seeker/test">
                    <Button variant="outline" className="w-full justify-start hover:bg-[#FF7A00]/10">
                      <Brain className="w-4 h-4 mr-2" />
                      Take Skills Assessment
                    </Button>
                  </Link>
                  <Link href="/job-seeker/search">
                    <Button variant="outline" className="w-full justify-start hover:bg-[#0A2540]/10">
                      <Search className="w-4 h-4 mr-2" />
                      Find Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0A2540]">
                    <Bell className="w-5 h-5 text-[#00C49A]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                    <p className="text-sm">Your job applications and updates will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ========== RECOMMENDATIONS ========== */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0A2540]">
                  <Users className="w-5 h-5 text-[#FF7A00]" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recommendations yet</p>
                  <p className="text-sm">Complete your profile and assessment to get personalized job recommendations</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

/* ─────────────── helper components ─────────────── */
function SidebarLink({ href, icon: Icon, text, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-[#00C49A]/10 text-[#00C49A] font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-[#0A2540]"
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {text}
    </Link>
  )
}

function StatsCard({ title, value, icon: Icon, color, children }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {children}
      </CardContent>
    </Card>
  )
}