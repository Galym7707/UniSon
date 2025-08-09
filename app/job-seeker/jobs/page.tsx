'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Building2, AlertCircle, Sparkles, Filter, Heart, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import JobSeekerLayout from '@/components/JobSeekerLayout'

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
  reasoning?: string
  experience_level?: string
}

type Filters = {
  search: string
  location: string
  salaryMin: string
  salaryMax: string
  employmentTypes: string[]
  remoteOnly: boolean
  experienceLevel: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [recommendations, setRecommendations] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [savingJob, setSavingJob] = useState<string | null>(null)
  const [matchScoreFilter, setMatchScoreFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    employmentTypes: [],
    remoteOnly: false,
    experienceLevel: ''
  })
  
  const supabase = createBrowserClient()

  useEffect(() => {
    loadJobs()
    loadRecommendations()
  }, [filters, sortBy])

  const buildQueryParams = () => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.location) params.append('location', filters.location)
    if (filters.salaryMin) params.append('salary_min', filters.salaryMin)
    if (filters.salaryMax) params.append('salary_max', filters.salaryMax)
    if (filters.employmentTypes.length > 0) params.append('employment_types', filters.employmentTypes.join(','))
    if (filters.remoteOnly) params.append('remote_only', 'true')
    if (filters.experienceLevel) params.append('experience_level', filters.experienceLevel)
    if (sortBy) params.append('sort_by', sortBy)
    
    return params.toString()
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryString = buildQueryParams()
      const response = await fetch(`/api/jobs?${queryString}`)
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

  const loadRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      
      const response = await fetch('/api/recommendations')
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, skip recommendations
          setRecommendations([])
          return
        }
        throw new Error(`Failed to fetch recommendations: ${response.status}`)
      }
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleEmploymentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      updateFilter('employmentTypes', [...filters.employmentTypes, type])
    } else {
      updateFilter('employmentTypes', filters.employmentTypes.filter(t => t !== type))
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      employmentTypes: [],
      remoteOnly: false,
      experienceLevel: ''
    })
    setMatchScoreFilter('all')
    setSortBy('date')
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const filterJobsByMatchScore = (jobList: Job[]) => {
    if (matchScoreFilter === 'all') return jobList
    
    return jobList.filter(job => {
      const score = job.match_score || 0
      switch (matchScoreFilter) {
        case '80+': return score >= 80
        case '60-79': return score >= 60 && score < 80
        case '40-59': return score >= 40 && score < 60
        case '<40': return score < 40
        default: return true
      }
    })
  }

  const filteredJobs = filterJobsByMatchScore(jobs)

  const JobCard = ({ job, isRecommendation = false }: { job: Job, isRecommendation?: boolean }) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-[#0A2540]">{job.title}</h3>
              {job.match_score && (
                <Badge className={`${getMatchScoreColor(job.match_score)} border`}>
                  {job.match_score}% match
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
                {job.remote && <Badge variant="secondary" className="ml-1">Remote</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(job.posted_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
              <Badge variant="outline">{job.employment_type}</Badge>
              {job.experience_level && (
                <Badge variant="outline">{job.experience_level}</Badge>
              )}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

            {job.reasoning && isRecommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Why this matches you:</p>
                    <p className="text-sm text-blue-700">{job.reasoning}</p>
                  </div>
                </div>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-6">
            <Button
              onClick={() => saveJob(job.id)}
              disabled={savingJob === job.id}
              variant="outline"
              size="sm"
              className="min-w-[100px]"
            >
              {savingJob === job.id ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Link href={`/job-seeker/results?job=${job.id}`}>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <JobSeekerLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540] mb-2">Browse Jobs</h1>
            <p className="text-gray-600">
              {jobs.length > 0 ? `${jobs.length} job opportunities available` : 'Discover your next opportunity'}
            </p>
          </div>
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {message && (
          <Alert className={`mb-6 ${
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
          {/* Filters Panel */}
          <div className={`lg:col-span-1 ${showFilters || 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm text-gray-600"
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search Keywords</Label>
                  <Input
                    id="search"
                    placeholder="Job title, skills, company..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, country..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                  />
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label>Salary Range (₽)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      value={filters.salaryMin}
                      onChange={(e) => updateFilter('salaryMin', e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={filters.salaryMax}
                      onChange={(e) => updateFilter('salaryMax', e.target.value)}
                      type="number"
                    />
                  </div>
                </div>

                {/* Employment Types */}
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'full-time', label: 'Full Time' },
                      { value: 'part-time', label: 'Part Time' },
                      { value: 'contract', label: 'Contract' },
                      { value: 'internship', label: 'Internship' },
                      { value: 'freelance', label: 'Freelance' }
                    ].map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={filters.employmentTypes.includes(type.value)}
                          onCheckedChange={(checked) => 
                            handleEmploymentTypeChange(type.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={type.value} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remote Work */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={filters.remoteOnly}
                    onCheckedChange={(checked) => updateFilter('remoteOnly', checked)}
                  />
                  <Label htmlFor="remote" className="text-sm">Remote work only</Label>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select 
                    value={filters.experienceLevel} 
                    onValueChange={(value) => updateFilter('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any level</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Match Score Filter */}
                <div className="space-y-2">
                  <Label>AI Match Score</Label>
                  <Select 
                    value={matchScoreFilter} 
                    onValueChange={setMatchScoreFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All matches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All matches</SelectItem>
                      <SelectItem value="80+">80%+ (Excellent)</SelectItem>
                      <SelectItem value="60-79">60-79% (Good)</SelectItem>
                      <SelectItem value="40-59">40-59% (Fair)</SelectItem>
                      <SelectItem value="<40">Below 40%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Sort and Filter Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Posted</SelectItem>
                      <SelectItem value="salary">Salary (High to Low)</SelectItem>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="match">AI Match Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Recommended for You Section */}
            {recommendations.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-[#00C49A]" />
                  <h2 className="text-2xl font-bold text-[#0A2540]">Recommended for You</h2>
                </div>
                <p className="text-gray-600 mb-6">AI-curated job matches based on your profile and preferences</p>
                
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner className="w-6 h-6 mx-auto" />
                    <p className="text-gray-600 mt-2">Loading recommendations...</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    {recommendations.slice(0, 3).map((job) => (
                      <JobCard key={job.id} job={job} isRecommendation={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Jobs */}
            <div>
              <h2 className="text-xl font-bold text-[#0A2540] mb-4">
                All Job Listings ({filteredJobs.length} jobs)
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <LoadingSpinner className="w-8 h-8 mx-auto" />
                  <p className="text-gray-600 mt-4">Loading jobs...</p>
                </div>
              ) : error ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center text-center">
                      <div>
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Jobs</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button
                          onClick={loadJobs}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Jobs Found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Try adjusting your filters to see more results.
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear All Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  )
}