'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Filter, Brain, AlertCircle } from "lucide-react"
import { createBrowserClient } from '@/lib/supabase/browser'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'
import { usePathname } from 'next/navigation'

type Job = {
  id: string
  title: string
  company: string
  location: string
  salary_min: number
  salary_max: number
  employment_type: string
  remote: boolean
  posted_at: string
  skills: string[]
  description: string
  match_score?: number
}

type Filters = {
  search: string
  location: string
  salary_min: string
  salary_max: string
  employment_types: string[]
  remote_only: boolean
  experience_level: string
}

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

export default function JobsPage() {
  const pathname = usePathname()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [savingJob, setSavingJob] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    salary_min: '',
    salary_max: '',
    employment_types: [],
    remote_only: false,
    experience_level: ''
  })
  const [sortBy, setSortBy] = useState('match')
  const supabase = createBrowserClient()

  useEffect(() => {
    loadJobs()
  }, [filters, sortBy])

  const loadJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.location) params.append('location', filters.location)
      if (filters.salary_min) params.append('salary_min', filters.salary_min)
      if (filters.salary_max) params.append('salary_max', filters.salary_max)
      if (filters.employment_types.length > 0) params.append('employment_types', filters.employment_types.join(','))
      if (filters.remote_only) params.append('remote_only', 'true')
      if (filters.experience_level) params.append('experience_level', filters.experience_level)
      if (sortBy) params.append('sort_by', sortBy)

      const response = await fetch(`/api/jobs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`)
      }
      
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
      setError('Failed to load jobs. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveJob = async (jobId: string) => {
    setSavingJob(jobId)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: 'Please log in to save jobs' })
        return
      }

      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: user.id,
          job_id: jobId,
          saved_at: new Date().toISOString()
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage({ type: 'error', text: 'Job is already saved' })
        } else {
          setMessage({ type: 'error', text: 'Failed to save job' })
        }
        return
      }

      setMessage({ type: 'success', text: 'Job saved successfully!' })
    } catch (error) {
      console.error('Error saving job:', error)
      setMessage({ type: 'error', text: 'Failed to save job' })
    } finally {
      setSavingJob(null)
    }
  }

  const updateFilters = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const formatSalary = (min: number, max: number) => {
    if (min === max) return `${min.toLocaleString()} ₽`
    return `${min.toLocaleString()}–${max.toLocaleString()} ₽`
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
            </div>
            <nav className="px-4 space-y-2">
              <SidebarLink href="/job-seeker/dashboard" icon={<LayoutDashboard />} pathname={pathname}>
                Dashboard
              </SidebarLink>
              <SidebarLink href="/job-seeker/profile" icon={<User />} pathname={pathname}>
                Profile
              </SidebarLink>
              <SidebarLink href="/job-seeker/test" icon={<Brain />} pathname={pathname}>
                Test
              </SidebarLink>
              <SidebarLink href="/job-seeker/jobs" icon={<Search />} pathname={pathname}>
                Jobs
              </SidebarLink>
              <SidebarLink href="/job-seeker/saved" icon={<Heart />} pathname={pathname}>
                Saved
              </SidebarLink>
              <SidebarLink href="/job-seeker/settings" icon={<Settings />} pathname={pathname}>
                Settings
              </SidebarLink>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Jobs</h1>

              {message && (
                <Alert className={`mb-4 ${
                  message.type === 'success' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0A2540] flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Search */}
                      <div className="space-y-2">
                        <Label>Search</Label>
                        <Input 
                          placeholder="Job title, company, skills..."
                          value={filters.search}
                          onChange={(e) => updateFilters('search', e.target.value)}
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          placeholder="City or remote"
                          value={filters.location}
                          onChange={(e) => updateFilters('location', e.target.value)}
                        />
                      </div>

                      {/* Employment Type */}
                      <div className="space-y-2">
                        <Label>Employment Type</Label>
                        <div className="space-y-2">
                          {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={type}
                                checked={filters.employment_types.includes(type.toLowerCase())}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilters('employment_types', [...filters.employment_types, type.toLowerCase()])
                                  } else {
                                    updateFilters('employment_types', filters.employment_types.filter(t => t !== type.toLowerCase()))
                                  }
                                }}
                              />
                              <Label htmlFor={type}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Remote Only */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remote"
                          checked={filters.remote_only}
                          onCheckedChange={(checked) => updateFilters('remote_only', checked)}
                        />
                        <Label htmlFor="remote">Remote only</Label>
                      </div>

                      {/* Salary Range */}
                      <div className="space-y-2">
                        <Label>Salary Range (₽)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Min"
                            type="number"
                            value={filters.salary_min}
                            onChange={(e) => updateFilters('salary_min', e.target.value)}
                          />
                          <Input 
                            placeholder="Max"
                            type="number"
                            value={filters.salary_max}
                            onChange={(e) => updateFilters('salary_max', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Job Results */}
                <div className="lg:col-span-3">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-[#333333]">
                      {loading ? 'Loading...' : `${jobs.length} jobs found`}
                    </p>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Best Match</SelectItem>
                        <SelectItem value="date">Most Recent</SelectItem>
                        <SelectItem value="salary">Highest Salary</SelectItem>
                        <SelectItem value="company">Company A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  )}

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  {!loading && !error && jobs.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[#0A2540] mb-2">No jobs found</h3>
                        <p className="text-[#333333]">Try adjusting your filters or search terms.</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-[#0A2540] mb-1">{job.title}</h3>
                              <div className="flex items-center gap-2 text-[#333333] mb-2">
                                <Building2 className="w-4 h-4" />
                                <span>{job.company}</span>
                                <MapPin className="w-4 h-4 ml-2" />
                                <span>{job.location}</span>
                                {job.remote && (
                                  <Badge variant="secondary" className="ml-2">Remote</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[#666666]">
                                <span className="font-medium text-[#00C49A]">
                                  {formatSalary(job.salary_min, job.salary_max)}
                                </span>
                                <Badge variant="outline">{job.employment_type}</Badge>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(job.posted_at)}</span>
                                </div>
                              </div>
                            </div>
                            {job.match_score && (
                              <Badge className="bg-[#00C49A] hover:bg-[#00A085]">
                                {job.match_score}% match
                              </Badge>
                            )}
                          </div>

                          <p className="text-[#333333] mb-4 line-clamp-3">{job.description}</p>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 6).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 6 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.skills.length - 6} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => saveJob(job.id)}
                                disabled={savingJob === job.id}
                              >
                                <Heart className="w-4 h-4 mr-1" />
                                {savingJob === job.id ? 'Saving...' : 'Save'}
                              </Button>
                              <Button size="sm" className="bg-[#00C49A] hover:bg-[#00A085]">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}