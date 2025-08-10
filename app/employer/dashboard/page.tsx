//app/employer/dashboard/page.tsx

import { requireAuth } from '@/lib/auth-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Briefcase, Building2, Plus, Users, Calendar, TrendingUp, Settings } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"

export const dynamic = 'force-dynamic'

export default async function EmployerDashboard() {
  // Require authentication and employer role
  const { user, profile } = await requireAuth({ role: 'employer' })

  const activeJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      posted: "3 days ago",
      newCandidates: 12,
      totalCandidates: 45,
      status: "Active",
    },
    {
      id: 2,
      title: "React Native Developer",
      posted: "1 week ago",
      newCandidates: 8,
      totalCandidates: 32,
      status: "Active",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      posted: "5 days ago",
      newCandidates: 15,
      totalCandidates: 28,
      status: "Active",
    },
    {
      id: 4,
      title: "UI/UX Designer",
      posted: "2 weeks ago",
      newCandidates: 3,
      totalCandidates: 67,
      status: "Paused",
    },
  ]

  const stats = [
    {
      title: "Active Jobs",
      value: "4",
      change: "+2 this week",
      icon: Briefcase,
    },
    {
      title: "New Candidates",
      value: "38",
      change: "+15 today",
      icon: Users,
    },
    {
      title: "Interviews",
      value: "12",
      change: "This week",
      icon: Calendar,
    },
    {
      title: "Profile Views",
      value: "1,234",
      change: "+23% this month",
      icon: TrendingUp,
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r">
            <div className="p-6">
              <Link href="/" className="text-xl font-bold text-[#0A2540]">
                Unison AI
              </Link>
              <p className="text-sm text-[#333333] mt-1">Employer Dashboard</p>
              <div className="mt-2 text-xs text-gray-500">
                Welcome, {profile.name || profile.email}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {profile.role}
                </Badge>
              </div>
            </div>
            <nav className="px-4 space-y-2">
              <Link
                href="/employer/dashboard"
                className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/employer/jobs"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Briefcase className="w-5 h-5 mr-3" />
                Jobs
              </Link>
              <Link
                href="/employer/company"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Building2 className="w-5 h-5 mr-3" />
                Company Profile
              </Link>
              <Link
                href="/employer/candidates"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Users className="w-5 h-5 mr-3" />
                Candidates
              </Link>
              <Link
                href="/employer/settings"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#0A2540]">Employer Dashboard</h1>
                  <p className="text-[#333333] mt-1">Manage your jobs and candidates</p>
                </div>
                <Link href="/employer/jobs/create">
                  <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#333333]">{stat.title}</p>
                          <p className="text-2xl font-bold text-[#0A2540]">{stat.value}</p>
                          <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                        </div>
                        <stat.icon className="w-8 h-8 text-[#FF7A00]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Active Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Active Jobs</CardTitle>
                  <CardDescription>Manage your open positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-[#0A2540]">{job.title}</h3>
                              <Badge
                                variant={job.status === "Active" ? "default" : "secondary"}
                                className={job.status === "Active" ? "bg-[#00C49A] text-white" : ""}
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#333333] mb-3">Posted {job.posted}</p>
                            <div className="flex items-center space-x-6 text-sm">
                              <span className="text-[#333333]">
                                Total candidates: <span className="font-semibold">{job.totalCandidates}</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="bg-[#FF7A00] text-white rounded-full w-16 h-16 flex items-center justify-center mb-2">
                              <span className="text-xl font-bold">+{job.newCandidates}</span>
                            </div>
                            <p className="text-xs text-[#333333]">new candidates</p>
                          </div>

                          <div className="ml-6">
                            <Link href={`/employer/jobs/${job.id}/candidates`}>
                              <Button className="bg-[#00C49A] hover:bg-[#00A085] text-white">
                                View Candidates
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/employer/jobs/create">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Job
                      </Button>
                    </Link>
                    <Link href="/employer/company">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/employer/candidates">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        View Candidates
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium">New Application</p>
                        <p className="text-gray-600">Senior Frontend Developer</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Profile Updated</p>
                        <p className="text-gray-600">ABC Tech Company</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">New Job Posted</p>
                        <p className="text-gray-600">React Native Developer</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profile Views</span>
                        <span className="font-semibold">234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Applications</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="font-semibold">12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}