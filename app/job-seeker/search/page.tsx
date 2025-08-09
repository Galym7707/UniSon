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
import { MapPin, Clock, Building2, Filter, AlertCircle } from "lucide-react"
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

  return (
    <JobSeekerLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Job Search</h1>

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
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search Keywords</Label>
                  <Input
                    id="search"
                    placeholder="Job title, skills, company..."
                    value={filters.search}
                    onChange={(e) => updateFilters('search', e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCountry && (
                    <Select value={filters.location} onValueChange={(value) => updateFilters('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label>Salary Range (₽)</Label>
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

                {/* Employment Types */}
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <div className="space-y-2">
                    {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
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

                {/* Remote Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={filters.remote_only}
                    onCheckedChange={(checked) => updateFilters('remote_only', checked)}
                  />
                  <Label htmlFor="remote" className="text-sm">Remote only</Label>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={filters.experience_level} onValueChange={(value) => updateFilters('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0A2540]">
                  {jobsLoading ? 'Searching...' : `${jobs.length} jobs found`}
                </h2>
                <p className="text-sm text-gray-600">Find your perfect match</p>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {jobsError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {jobsError}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {jobsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="flex gap-2 mb-4">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-[#0A2540]">{job.title}</h3>
                              {job.match_score && (
                                <Badge className="bg-[#00C49A] text-white">
                                  {job.match_score}% match
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-[#333333] mb-3">
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

                            <p className="text-[#333333] mb-4 line-clamp-2">{job.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {job.skills?.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills?.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{job.skills.length - 3} more
                                  </Badge>
                                )}
                                {job.remote && (
                                  <Badge className="bg-[#00C49A] text-white text-xs">Remote</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[#0A2540]">
                                  {formatSalary(job.salary_min, job.salary_max)}
                                </p>
                                <p className="text-sm text-[#333333]">{job.employment_type}</p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveJob(job.id)}
                              disabled={savingJob === job.id}
                            >
                              {savingJob === job.id ? (
                                <LoadingSpinner className="w-4 h-4" />
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button className="bg-[#FF7A00] hover:bg-[#E66A00] text-white" size="sm">
                              Apply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-semibold text-[#0A2540] mb-2">No Jobs Found</h3>
                      <p className="text-[#333333] mb-4">
                        Try adjusting your filters or search terms to find more opportunities.
                      </p>
                      <Button
                        onClick={() => {
                          setFilters({
                            search: '',
                            location: '',
                            salary_min: '',
                            salary_max: '',
                            employment_types: [],
                            remote_only: false,
                            experience_level: ''
                          })
                          setSelectedCountry('')
                        }}
                        variant="outline"
                      >
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  )
}