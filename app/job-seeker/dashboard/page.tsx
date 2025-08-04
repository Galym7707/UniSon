// app/job-seeker/dashboard/page.tsx
'use client'

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Progress, Badge, Button
} from '@ui'                                       // NOTE: use @ui if you created the index.ts
import {
  LayoutDashboard, User, Search, Settings, Eye, Calendar,
  MapPin, Clock, Heart, BadgePercent, Brain
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'

export default function JobSeekerDashboard() {
  const [profilePct, setProfilePct] = useState(0)

  /* --- load profile completeness from Supabase --- */
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('first_name,last_name,title,summary,experience,skills')
        .eq('email', user.email)
        .single()

      if (!data) return
      const filled = Object.values(data).filter(v => v && v !== '').length
      const total = 6
      setProfilePct(Math.round((filled / total) * 100))
    })
  }, [])

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
        {/* ====== sidebar ====== */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6 font-bold text-xl text-[#0A2540]">
            Unison AI
          </div>
          <nav className="px-4 space-y-2">
                      <SidebarLink href="/job-seeker/dashboard" icon={LayoutDashboard} text="Dashboard" active />
          <SidebarLink href="/job-seeker/profile"    icon={User}            text="Profile" />
          <SidebarLink href="/job-seeker/test"       icon={Brain}           text="Тест" />
          <SidebarLink href="/job-seeker/search"     icon={Search}          text="Job search" />
          <SidebarLink href="/job-seeker/saved"      icon={Heart}           text="Saved" />
          <SidebarLink href="/job-seeker/settings"   icon={Settings}        text="Settings" />
          </nav>
        </aside>

        {/* ====== main ====== */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-[#0A2540] mb-8">
            Welcome back, <span className="text-[#00C49A]">Friend</span>!
          </h1>

          {/* GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ---------- LEFT column ---------- */}
            <section className="lg:col-span-2 space-y-6">

              {/* Application status */}
              <Card>
                <CardHeader>
                  <CardTitle>Application status</CardTitle>
                  <CardDescription>Track every job you’ve applied for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.map(app => (
                    <div key={app.id}
                         className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold text-[#0A2540]">{app.position}</h4>
                        <p className="text-sm">{app.company}</p>
                        <p className="text-xs text-gray-500">{app.date}</p>
                      </div>
                      <Badge
                        className={app.status === 'Interview' ? 'bg-[#00C49A] text-white' : ''}
                        variant={app.status === 'Interview' ? 'default' : 'secondary'}
                      >
                        {app.status}
                      </Badge>
                      {app.status === 'Interview' && (
                        <Button size="sm" className="bg-[#FF7A00] hover:bg-[#E66A00]">
                          <Calendar className="h-4 w-4 mr-1" /> Respond
                        </Button>
                      )}
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
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#00C49A]">{profilePct} %</span>
                    <Link href="/job-seeker/profile">
                      <Button variant="outline" size="sm">Finish profile</Button>
                    </Link>
                  </div>
                  <Progress value={profilePct} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Legend color="green"  text="Personal info"   done={profilePct >= 20} />
                    <Legend color="green"  text="Work experience" done={profilePct >= 40} />
                    <Legend color="orange" text="Skills"          done={profilePct >= 60} />
                    <Legend color="gray"   text="Testing"         done={profilePct >= 80} />
                  </div>
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
                    <div key={job.id}
                         className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-[#0A2540] mb-2">{job.position}</h4>
                      <p className="text-sm mb-2">{job.company}</p>
                      <div className="flex text-xs text-gray-500 space-x-3 mb-3">
                        <MapPin className="h-3 w-3 mr-1" /> {job.location}
                        <Clock className="h-3 w-3 mr-1" /> {job.salary}
                      </div>
                      <Button size="sm" variant="outline"
                              className="w-full border-[#00C49A] text-[#00C49A] hover:bg-[#00C49A] hover:text-white">
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
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
    <Link href={href}
          className={`flex items-center px-4 py-3 rounded-lg
            ${active
              ? 'text-[#00C49A] bg-[#00C49A]/10'
              : 'text-[#333] hover:bg-gray-100'}`}>
      <Icon className="h-5 w-5 mr-3" /> {text}
    </Link>
  )
}

function Legend({ color, text, done }: { color: string; text: string; done: boolean }) {
  const map: Record<string,string> = {
    green:   'bg-green-600 text-green-600',
    orange:  'bg-orange-500 text-orange-500',
    gray:    'bg-gray-400 text-gray-400'
  }
  return (
    <div className={`flex items-center ${map[color]}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${map[color].split(' ')[0]}`}></div>
      {text}
    </div>
  )
}
