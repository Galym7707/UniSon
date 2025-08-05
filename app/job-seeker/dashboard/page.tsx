// app/job-seeker/dashboard/page.tsx
'use client'

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Progress, Badge, Button
} from '@/components/ui'
import {
  LayoutDashboard, User, Search, Settings, Eye, Calendar,
  MapPin, Clock, Heart, Brain, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export default function JobSeekerDashboard() {
  /* state */
  const [profilePct, setProfilePct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* --- load profile --- */
  useEffect(() => {
    let isMounted = true

    const loadProfileData = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseBrowser()

        /** 1️⃣  БЕРЁМ getSession, а не getUser */
        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession()

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
        }
      } catch (err) {
        setError(getUserFriendlyErrorMessage(err))
        logError("job-seeker-dashboard", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProfileData()
    return () => {
      isMounted = false
    }
  }, [])

  const retry = () => window.location.reload()

  /* ───────── демо-данные ───────── */
  const applications = [
    { id: 1, company: 'TechCorp',  position: 'Frontend Developer', status: 'Under review', date: '2 days ago' },
    { id: 2, company: 'StartupXYZ', position: 'React Developer',    status: 'Interview',    date: '1 day ago' },
    { id: 3, company: 'BigTech',   position: 'Senior Developer',   status: 'Under review', date: '5 days ago' }
  ]
  const recommendations = [
    { id: 1, company: 'InnovateLab', position: 'Full-stack Dev',  location: 'Moscow',       salary: '150–200 k' },
    { id: 2, company: 'DevStudio',   position: 'React Native',    location: 'St Petersburg', salary: '120–180 k' },
    { id: 3, company: 'TechFlow',    position: 'Frontend Lead',   location: 'Remote',        salary: '200–250 k' }
  ]

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* mobile-overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ───────── sidebar ───────── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm
                      transition-transform duration-300 lg:translate-x-0
                      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-6">
            <span className="font-bold text-xl text-[#0A2540]">Unison AI</span>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-4 space-y-2">
            <NavItem href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" active />
            <NavItem href="/job-seeker/profile"   icon={User}            text="Profile" />
            <NavItem href="/job-seeker/test"      icon={Brain}           text="Test" />
            <NavItem href="/job-seeker/search"    icon={Search}          text="Job search" />
            <NavItem href="/job-seeker/saved"     icon={Heart}           text="Saved" />
            <NavItem href="/job-seeker/settings"  icon={Settings}        text="Settings" />
          </nav>
        </aside>

        {/* ───────── main ───────── */}
        <main className="flex-1">
          {/* mobile-header */}
          <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center">
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold mb-8">
              Welcome back, <span className="text-[#00C49A]">Friend</span>!
            </h2>

            {/* Show success message if profile was just created */}
            {/* This section is removed as per the new_code, as the profile creation logic is now handled by PGRST116 */}

            {/* Show error message if profile creation/loading failed */}
            {error && !loading && (
              <div className="mb-6">
                <ErrorDisplay 
                  error={error}
                  onRetry={retry}
                  variant="card"
                />
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">If this problem persists:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Try signing out and signing back in</li>
                    <li>• Clear your browser cache</li>
                    <li>• Contact support for assistance</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ===== GRID ===== */}
            <div className="grid xl:grid-cols-3 gap-8">
              {/* LEFT */}
              <section className="xl:col-span-2 space-y-6">
                {/* Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application status</CardTitle>
                    <CardDescription>Track every job you&rsquo;ve applied for</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{app.position}</h4>
                          <p className="text-sm truncate">{app.company}</p>
                          <p className="text-xs text-gray-500">{app.date}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant={app.status === 'Interview' ? 'default' : 'secondary'}
                            className={app.status === 'Interview' ? 'bg-[#00C49A] text-white' : ''}
                          >
                            {app.status}
                          </Badge>

                          {app.status === 'Interview' && (
                            <Button size="sm" className="bg-[#FF7A00] hover:bg-[#E66A00]">
                              <Calendar className="h-4 w-4 mr-1" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Profile completeness */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile completeness</CardTitle>
                    <CardDescription>Complete your profile to get the best matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                        <span className="ml-3 text-gray-600">Loading profile data...</span>
                      </div>
                    ) : error ? (
                      <ErrorDisplay error={error} onRetry={retry} variant="card" />
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-[#00C49A]">{profilePct}%</span>
                          <Link href="/job-seeker/profile">
                            <Button variant="outline" size="sm">
                              {/* This button text is now less relevant as profile creation is handled by PGRST116 */}
                              Complete profile
                            </Button>
                          </Link>
                        </div>
                        <Progress value={profilePct} className="h-3" />
                        {profilePct < 100 && (
                          <p className="text-sm text-gray-600 mt-2">
                            {profilePct === 0 
                              ? "Get started by adding your basic information"
                              : profilePct < 50 
                              ? "Add more details to improve your job matches"
                              : "You're almost done! Complete your profile to maximize opportunities"
                            }
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* RIGHT */}
              <section className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended jobs</CardTitle>
                    <CardDescription>Tailored especially for you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map(job => (
                      <article key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-1">{job.position}</h4>
                        <p className="text-sm mb-2">{job.company}</p>
                        <div className="flex text-xs text-gray-500 gap-3 mb-3">
                          <div className="flex items-center"><MapPin className="h-3 w-3 mr-1"/>{job.location}</div>
                          <div className="flex items-center"><Clock  className="h-3 w-3 mr-1"/>{job.salary}</div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" /> View details
                        </Button>
                      </article>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ───────── helpers ───────── */
function NavItem({ href, icon: Icon, text, active = false }:{
  href: string; icon: React.ElementType; text: string; active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors
                  ${active ? 'bg-[#00C49A]/10 text-[#00C49A]' : 'hover:bg-gray-100'}`}
    >
      <Icon className="h-5 w-5 mr-3" /> {text}
    </Link>
  )
}