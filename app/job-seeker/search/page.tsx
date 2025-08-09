'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Filter, Brain, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

type Job = {
  id: string
  title: string
  company: string
  city: string
  country: string
  salary_min: number
  salary_max: number
  employment_type: string
  remote_work_option: boolean
  posted_at: string
  required_skills: string[]
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

type Country = {
  id: string
  name: string
  code: string
}

type City = {
  id: string
  name: string
  country: string
}

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  
  // Loading states
  const [jobsLoading, setJobsLoading] = useState(true)
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [savingJob, setSavingJob] = useState<string | null>(null)
  
  // Error states
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [citiesError, setCitiesError] = useState<string | null>(null)
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
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
    loadCountries()
    loadJobs()
  }, [])

  useEffect(() => {
    loadJobs()
  }, [filters, sortBy])

  useEffect(() => {
    if (selectedCountry) {
      loadCities(selectedCountry)
    } else {
      setCities([])
    }
  }, [selectedCountry])

  const loadCountries = async () => {
    setCountriesLoading(true)
    setCountriesError(null)
    
    try {
      const response = await fetch('/api/countries')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`)
      }
      
      const data = await response.json()
      setCountries(data.countries || [])
    } catch (error) {
      console.error('Error loading countries:', error)
      setCountriesError('Failed to load countries. Please try again.')
    } finally {
      setCountriesLoading(false)
    }
  }

  const loadCities = async (countryId: string) => {
    setCitiesLoading(true)
    setCitiesError(null)
    
    try {
      const response = await fetch(`/api/cities?country=${countryId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.status}`)
      }
      
      const data = await response.json()
      setCities(data.cities || [])
    } catch (error) {
      console.error('Error loading cities:', error)
      setCitiesError('Failed to load cities. Please try again.')
    } finally {
      setCitiesLoading(false)
    }
  }

  const loadJobs = async () => {
    setJobsLoading(true)
    setJobsError(null)
    
    try {
      // Build query parameters with updated field names
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.location) params.append('city', filters.location) // Updated to use city parameter
      if (filters.salary_min) params.append('salary_min', filters.salary_min)
      if (filters.salary_max) params.append('salary_max', filters.salary_max)
      if (filters.employment_types.length > 0) params.append('employment_types', filters.employment_types.join(','))
      if (filters.remote_only) params.append('remote_work_option', 'true') // Updated field name
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
      setJobsError('Failed to load jobs. Please check your connection and try again.')
    } finally {
      setJobsLoading(false)
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

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-[#0A2540]">{job.title}</h3>
              {job.match_score && (
                <Badge variant="outline" className="text-sm">
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
                <span>{job.city}, {job.country}</span>
                {job.remote_work_option && <Badge variant="secondary" className="ml-1">Remote</Badge>}
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
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

            {job.required_skills && job.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.required_skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.required_skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.required_skills.length - 5} more
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
                Browse & Search Jobs
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
              <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Browse & Search Jobs</h1>

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
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Search Input */}
                      <div>
                        <Label htmlFor="search" className="text-sm font-medium">
                          Keywords
                        </Label>
                        <Input
                          id="search"
                          placeholder="Job title, company, or skills"
                          value={filters.search}
                          onChange={(e) => updateFilters('search', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Location Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Location
                        </Label>
                        <div className="space-y-3">
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countriesLoading ? (
                                <div className="p-2 text-center">
                                  <LoadingSpinner className="w-4 h-4 mx-auto" />
                                </div>
                              ) : countries.length > 0 ? (
                                countries.map((country) => (
                                  <SelectItem key={country.id} value={country.id}>
                                    {country.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-gray-500">
                                  No countries available
                                </div>
                              )}
                            </SelectContent>
                          </Select>

                          {selectedCountry && (
                            <Select 
                              value={filters.location} 
                              onValueChange={(value) => updateFilters('location', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                {citiesLoading ? (
                                  <div className="p-2 text-center">
                                    <LoadingSpinner className="w-4 h-4 mx-auto" />
                                  </div>
                                ) : cities.length > 0 ? (
                                  cities.map((city) => (
                                    <SelectItem key={city.id} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-gray-500">
                                    No cities available
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      {/* Remote Work */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remote"
                          checked={filters.remote_only}
                          onCheckedChange={(checked) => updateFilters('remote_only', checked)}
                        />
                        <Label htmlFor="remote" className="text-sm font-medium">
                          Remote work only
                        </Label>
                      </div>

                      {/* Salary Range */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Salary Range (₽)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Min"
                            value={filters.salary_min}
                            onChange={(e) => updateFilters('salary_min', e.target.value)}
                          />
                          <Input
                            placeholder="Max"
                            value={filters.salary_max}
                            onChange={(e) => updateFilters('salary_max', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Employment Type */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Employment Type
                        </Label>
                        <div className="space-y-2">
                          {['full-time', 'part-time', 'contract', 'freelance', 'internship'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={type}
                                checked={filters.employment_types.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilters('employment_types', [...filters.employment_types, type])
                                  } else {
                                    updateFilters('employment_types', filters.employment_types.filter(t => t !== type))
                                  }
                                }}
                              />
                              <Label htmlFor={type} className="text-sm capitalize">
                                {type.replace('-', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Experience Level
                        </Label>
                        <Select 
                          value={filters.experience_level} 
                          onValueChange={(value) => updateFilters('experience_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any level</SelectItem>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior Level</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                <div className="lg:col-span-3">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#0A2540]">
                        {jobsLoading ? 'Searching...' : `${jobs.length} Jobs Found`}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Based on your search criteria
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Sort by:</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="match">Best Match</SelectItem>
                          <SelectItem value="date">Newest First</SelectItem>
                          <SelectItem value="salary_high">Salary High to Low</SelectItem>
                          <SelectItem value="salary_low">Salary Low to High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {jobsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <CardSkeleton key={i} />
                      ))}
                    </div>
                  ) : jobsError ? (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">
                          Failed to Load Jobs
                        </h3>
                        <p className="text-red-600 mb-4">{jobsError}</p>
                        <Button
                          onClick={loadJobs}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  ) : jobs.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Jobs Found
                        </h3>
                        <p className="text-gray-500">
                          Try adjusting your search criteria to find more opportunities.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
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