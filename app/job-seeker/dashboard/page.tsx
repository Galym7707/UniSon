// app/job-seeker/dashboard/page.tsx
'use client'

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Progress, Badge, Button
} from '@ui'                                       
import {
  LayoutDashboard, User, Search, Settings, Eye, Calendar,
  MapPin, Clock, Heart, BadgePercent, Brain, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorDisplay } from '@/components/ui/error-display'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export default function JobSeekerDashboard() {
  const [profilePct, setProfilePct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* --- load profile completeness from Supabase --- */
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createBrowserClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          throw authError
        }
        
        if (!user) {
          throw new Error('User not authenticated')
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('first_name,last_name,title,summary,experience,skills')
          .eq('email', user.email)
          .single()

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw profileError
        }

        if (data) {
          const filled = Object.values(data).filter(v => v && v !== '').length
          const total = 6
          setProfilePct(Math.round((filled / total) * 100))
        }
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err)
        logError('job-seeker-dashboard', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const retryLoadProfile = () => {
    const event = new Event('profile-retry')
    window.dispatchEvent(event)
    // Trigger the useEffect again by calling loadProfileData
    window.location.reload()
  }

  /* --- static demo data for the rest of the card --- */
  const applications = [
    { id: 1, company: 'TechCorp', position: 'Frontend Developer', status: 'Under review', date: '2 days ago' },
    { id: 2, company: 'StartupXYZ', position: 'React Developer',    status: 'Interview',   date: '1 day ago' },
    { id: 3, company: 'BigTech',   position: 'Senior Developer',   status: 'Under review', date: '5 days ago' }
  ]

  const recommendations = [
    { id: 1, company: 'InnovateLab', position: 'Full-stack Dev', location: 'Moscow',  salary: '150–200 k' },
    { id: 2, company: 'DevStudio',   position: 'React Native',  location: 'St Petersburg', salary: '120–180 k' },
    { id: 3, company: 'TechFlow',    position: 'Frontend Lead', location: 'Remote',  salary: '200–250 k' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ====== sidebar ====== */}
        <aside 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transform transition-transform duration-300 ease-in-out lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between p-6">
            <div className="font-bold text-xl text-[#0A2540]">
              Unison AI
            </div>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-4 space-y-2" role="list">
            <SidebarLink href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" active />
            <SidebarLink href="/job-seeker/profile"    icon={User}            text="Profile" />
            <SidebarLink href="/job-seeker/test"       icon={Brain}           text="Тест" />
            <SidebarLink href="/job-seeker/search"     icon={Search}          text="Job search" />
            <SidebarLink href="/job-seeker/saved"      icon={Heart}           text="Saved" />
            <SidebarLink href="/job-seeker/settings"   icon={Settings}        text="Settings" />
          </nav>
        </aside>

        {/* ====== main ====== */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
            <button
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="ml-4 text-lg font-semibold text-[#0A2540]">Dashboard</h1>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] mb-6 lg:mb-8">
              Welcome back, <span className="text-[#00C49A]">Friend</span>!
            </h1>

            {/* GRID */}
            <div className="grid xl:grid-cols-3 gap-6 lg:gap-8">
              {/* ---------- LEFT column ---------- */}
              <section className="xl:col-span-2 space-y-6">

                {/* Application status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application status</CardTitle>
                    <CardDescription>Track every job you've applied for</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id}
                           className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#0A2540] truncate">{app.position}</h4>
                          <p className="text-sm text-gray-600 truncate">{app.company}</p>
                          <p className="text-xs text-gray-500">{app.date}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge
                            className={app.status === 'Interview' ? 'bg-[#00C49A] text-white hover:bg-[#00B389]' : ''}
                            variant={app.status === 'Interview' ? 'default' : 'secondary'}
                          >
                            {app.status}
                          </Badge>
                          {app.status === 'Interview' && (
                            <Button size="sm" className="bg-[#FF7A00] hover:bg-[#E66A00] focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7A00]">
                              <Calendar className="h-4 w-4 mr-1" aria-hidden="true" /> 
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
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8" role="status" aria-label="Loading profile data">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : error ? (
                      <div role="alert">
                        <ErrorDisplay 
                          error={error}
                          onRetry={retryLoadProfile}
                          variant="card"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#00C49A]" aria-label={`Profile ${profilePct} percent complete`}>
                            {profilePct}%
                          </span>
                          <Link href="/job-seeker/profile">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="focus:ring-2 focus:ring-offset-2 focus:ring-[#00C49A]"
                            >
                              Finish profile
                            </Button>
                          </Link>
                        </div>
                        <Progress 
                          value={profilePct} 
                          className="h-3" 
                          aria-label={`Profile completion progress: ${profilePct}%`}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <Legend color="green"  text="Personal info"   done={profilePct >= 20} />
                          <Legend color="green"  text="Work experience" done={profilePct >= 40} />
                          <Legend color="orange" text="Skills"          done={profilePct >= 60} />
                          <Legend color="gray"   text="Testing"         done={profilePct >= 80} />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* ---------- RIGHT column ---------- */}
              <section className="space-y-6">
                {/* Recommended jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended jobs</CardTitle>
                    <CardDescription>Tailored especially for you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map(job => (
                      <article 
                        key={job.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#00C49A]"
                      >
                        <h4 className="font-semibold text-[#0A2540] mb-2">{job.position}</h4>
                        <p className="text-sm mb-2 text-gray-600">{job.company}</p>
                        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-3 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" aria-hidden="true" /> 
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" /> 
                            {job.salary}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full border-[#00C49A] text-[#00C49A] hover:bg-[#00C49A] hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-[#00C49A] transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" aria-hidden="true" /> 
                          View Details
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

/* ---------- helpers ---------- */
function SidebarLink({ href, icon: Icon, text, active = false }: {
  href: string
  icon: React.ElementType
  text: string
  active?: boolean
}) {
  return (
    <Link 
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C49A] ${
        active
          ? 'text-[#00C49A] bg-[#00C49A]/10'
          : 'text-[#333] hover:bg-gray-100'
      }`}
      role="listitem"
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="h-5 w-5 mr-3" aria-hidden="true" /> 
      {text}
    </Link>
  )
}

function Legend({ color, text, done }: { color: string; text: string; done: boolean }) {
  const colorMap: Record<string,string> = {
    green:   'bg-green-600 text-green-600',
    orange:  'bg-orange-500 text-orange-500',
    gray:    'bg-gray-400 text-gray-400'
  }
  
  const bgColor = colorMap[color]?.split(' ')[0] || 'bg-gray-400'
  const textColor = colorMap[color]?.split(' ')[1] || 'text-gray-400'
  
  return (
    <div className={`flex items-center ${textColor}`} role="listitem">
      <div 
        className={`w-2 h-2 rounded-full mr-2 ${bgColor}`}
        aria-hidden="true"
      />
      <span className="truncate">{text}</span>
      {done && <span className="sr-only"> - completed</span>}
    </div>
  )
}