//app/employer/jobs/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Plus,
  Search,
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Pause,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Header } from "@/components/header-landing"
import { Footer } from "@/components/footer"

export default function EmployerJobs() {
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Development",
      posted: "2024-01-15",
      status: "active",
      candidates: 45,
      newCandidates: 12,
      views: 234,
      salary: "200-300k",
      location: "Moscow",
    },
    {
      id: 2,
      title: "React Native Developer",
      department: "Mobile Development",
      posted: "2024-01-10",
      status: "active",
      candidates: 32,
      newCandidates: 8,
      views: 189,
      salary: "180-250k",
      location: "St. Petersburg",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Infrastructure",
      posted: "2024-01-12",
      status: "active",
      candidates: 28,
      newCandidates: 15,
      views: 156,
      salary: "220-320k",
      location: "Remote",
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      posted: "2024-01-05",
      status: "paused",
      candidates: 67,
      newCandidates: 3,
      views: 445,
      salary: "150-200k",
      location: "Moscow",
    },
    {
      id: 5,
      title: "Backend Developer",
      department: "Development",
      posted: "2024-01-08",
      status: "draft",
      candidates: 0,
      newCandidates: 0,
      views: 0,
      salary: "180-280k",
      location: "Kazan",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "draft":
        return "bg-gray-500"
      case "closed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "paused":
        return "Paused"
      case "draft":
        return "Draft"
      case "closed":
        return "Closed"
      default:
        return "Unknown"
    }
  }

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
              <p className="text-sm text-[#333333] mt-1">TechCorp Inc.</p>
            </div>
            <nav className="px-4 space-y-2">
              <Link
                href="/employer/dashboard"
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/employer/jobs"
                className="flex items-center px-4 py-3 text-[#FF7A00] bg-[#FF7A00]/10 rounded-lg"
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
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#0A2540]">Job Management</h1>
                <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input placeholder="Search by job title..." className="h-10" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="draft">Drafts</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-dept">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-dept">All Departments</SelectItem>
                        <SelectItem value="dev">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="mobile">Mobile Development</SelectItem>
                        <SelectItem value="infra">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-[#00C49A] hover:bg-[#00A085]">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Your Jobs ({jobs.length})</CardTitle>
                  <CardDescription>Manage all your open positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-[#0A2540]">{job.title}</h3>
                              <Badge className={`${getStatusColor(job.status)} text-white`}>
                                {getStatusText(job.status)}
                              </Badge>
                              {job.newCandidates > 0 && (
                                <Badge className="bg-[#FF7A00] text-white">+{job.newCandidates} new</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-[#333333] mb-3">
                              <span>{job.department}</span>
                              <span>{job.location}</span>
                              <span>{job.salary} ₽</span>
                              <span>Posted: {new Date(job.posted).toLocaleDateString("en-US")}</span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1 text-[#00C49A]" />
                                <span className="font-medium">{job.candidates}</span>
                                <span className="text-[#333333] ml-1">candidates</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-[#FF7A00]" />
                                <span className="font-medium">{job.views}</span>
                                <span className="text-[#333333] ml-1">views</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {job.status === "active" && (
                              <Link href={`/employer/jobs/${job.id}/candidates`}>
                                <Button className="bg-[#00C49A] hover:bg-[#00A085] text-white">
                                  Candidates ({job.candidates})
                                </Button>
                              </Link>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pause className="w-4 h-4 mr-2" />
                                  {job.status === "active" ? "Pause" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}