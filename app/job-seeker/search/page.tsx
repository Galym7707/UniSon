'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Filter, Brain } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'

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

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [savingJob, setSavingJob] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
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
    try {
      let query = supabase
        .from('jobs')
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,skills.ilike.%${filters.search}%`)
      }

      if (filters.location && filters.location !== 'remote') {
        query = query.eq('location', filters.location)
      }

      if (filters.remote_only) {
        query = query.eq('remote', true)
      }

      if (filters.salary_min) {
        query = query.gte('salary_min', parseInt(filters.salary_min))
      }

      if (filters.salary_max) {
        query = query.lte('salary_max', parseInt(filters.salary_max))
      }

      if (filters.employment_types.length > 0) {
        query = query.in('employment_type', filters.employment_types)
      }

      // Apply sorting
      if (sortBy === 'date') {
        query = query.order('posted_at', { ascending: false })
      } else if (sortBy === 'salary') {
        query = query.order('salary_max', { ascending: false })
      } else {
        // Default: by match score (if available) or by date
        query = query.order('posted_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading jobs:', error)
        return
      }

      // Calculate match scores based on user profile (simplified)
      const jobsWithScores = data?.map((job: any) => ({
        ...job,
        match_score: Math.floor(Math.random() * 30) + 70 // Placeholder match score
      })) || []

      setJobs(jobsWithScores)
    } catch (error) {
      console.error('Error:', error)
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
            <Link
              href="/job-seeker/dashboard"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/job-seeker/profile"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 mr-3" />
              Profile
            </Link>
            <Link
              href="/job-seeker/test"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Brain className="w-5 h-5 mr-3" />
              Test
            </Link>
            <Link
              href="/job-seeker/search"
              className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
            >
              <Search className="w-5 h-5 mr-3" />
              Job Search
            </Link>
            <Link
              href="/job-seeker/saved"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Heart className="w-5 h-5 mr-3" />
              Saved
            </Link>
            <Link
              href="/job-seeker/settings"
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Job Search</h1>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
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
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Search by keywords</Label>
                      <Input 
                        id="search" 
                        placeholder="React, JavaScript..." 
                        value={filters.search}
                        onChange={(e) => updateFilters('search', e.target.value)}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={filters.location} onValueChange={(value) => updateFilters('location', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Moscow">Moscow</SelectItem>
                          <SelectItem value="St. Petersburg">St. Petersburg</SelectItem>
                          <SelectItem value="Kazan">Kazan</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Salary Range */}
                    <div className="space-y-2">
                      <Label>Salary (₽)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="From" 
                          value={filters.salary_min}
                          onChange={(e) => updateFilters('salary_min', e.target.value)}
                        />
                        <Input 
                          placeholder="To" 
                          value={filters.salary_max}
                          onChange={(e) => updateFilters('salary_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-2">
                      <Label>Employment Type</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="fulltime" 
                            checked={filters.employment_types.includes('Full-time')}
                            onCheckedChange={(checked) => {
                              const types = checked 
                                ? [...filters.employment_types, 'Full-time']
                                : filters.employment_types.filter(t => t !== 'Full-time')
                              updateFilters('employment_types', types)
                            }}
                          />
                          <Label htmlFor="fulltime" className="text-sm">
                            Full-time
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="parttime" 
                            checked={filters.employment_types.includes('Part-time')}
                            onCheckedChange={(checked) => {
                              const types = checked 
                                ? [...filters.employment_types, 'Part-time']
                                : filters.employment_types.filter(t => t !== 'Part-time')
                              updateFilters('employment_types', types)
                            }}
                          />
                          <Label htmlFor="parttime" className="text-sm">
                            Part-time
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="contract" 
                            checked={filters.employment_types.includes('Contract')}
                            onCheckedChange={(checked) => {
                              const types = checked 
                                ? [...filters.employment_types, 'Contract']
                                : filters.employment_types.filter(t => t !== 'Contract')
                              updateFilters('employment_types', types)
                            }}
                          />
                          <Label htmlFor="contract" className="text-sm">
                            Contract
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Remote Work */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remote" 
                          checked={filters.remote_only}
                          onCheckedChange={(checked) => updateFilters('remote_only', checked)}
                        />
                        <Label htmlFor="remote" className="text-sm">
                          Remote work only
                        </Label>
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select value={filters.experience_level} onValueChange={(value) => updateFilters('experience_level', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Middle">Middle</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="w-full bg-[#00C49A] hover:bg-[#00A085]"
                      onClick={loadJobs}
                    >
                      Apply Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Job Results */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[#333333]">
                    {loading ? 'Loading...' : `Found ${jobs.length} jobs`}
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">By Match</SelectItem>
                      <SelectItem value="date">By Date</SelectItem>
                      <SelectItem value="salary">By Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
                      <p className="text-[#333333]">Loading jobs...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-[#0A2540] mb-1">{job.title}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-[#333333]">
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 mr-1" />
                                      {job.company}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {job.location}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {formatDate(job.posted_at)}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => saveJob(job.id)}
                                  disabled={savingJob === job.id}
                                >
                                  <Heart className={`w-5 h-5 ${savingJob === job.id ? 'animate-pulse' : ''}`} />
                                </Button>
                              </div>

                              <p className="text-[#333333] mb-4 line-clamp-2">{job.description}</p>

                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {job.skills?.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {job.remote && <Badge className="bg-[#00C49A] text-white text-xs">Remote</Badge>}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[#0A2540]">
                                    {formatSalary(job.salary_min, job.salary_max)}
                                  </p>
                                  <p className="text-sm text-[#333333]">{job.employment_type}</p>
                                </div>
                              </div>
                            </div>

                            <div className="ml-6 text-center">
                              <div className="relative w-16 h-16 mb-2">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#00C49A"
                                    strokeWidth="2"
                                    strokeDasharray={`${job.match_score || 85}, 100`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-[#00C49A]">{job.match_score || 85}</span>
                                </div>
                              </div>
                              <p className="text-xs text-[#333333] mb-3">Match</p>
                              <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white">Apply</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {jobs.length === 0 && !loading && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-[#0A2540] mb-2">No jobs found</h3>
                      <p className="text-[#333333] mb-6">Try adjusting your search criteria</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
