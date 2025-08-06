'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, User, Search, Settings, Heart, MapPin, Clock, Building2, Trash2, Brain } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'

type SavedJob = {
  id: string
  job_id: string
  user_id: string
  saved_at: string
  job: {
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
  }
}

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const loadSavedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          job_id,
          user_id,
          saved_at,
          job:jobs (
            id,
            title,
            company,
            location,
            salary_min,
            salary_max,
            employment_type,
            remote,
            posted_at,
            skills,
            description
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading saved jobs:', error)
        return
      }

      // Transform the data to match our SavedJob type
      const transformedData = data?.map((item: any) => ({
        id: item.id,
        job_id: item.job_id,
        user_id: item.user_id,
        saved_at: item.saved_at,
        job: Array.isArray(item.job) ? item.job[0] : item.job
      })) || []

      setSavedJobs(transformedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId)

      if (error) {
        setMessage({ type: 'error', text: 'Failed to remove job from saved list' })
        return
      }

      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId))
      setMessage({ type: 'success', text: 'Job removed from saved list' })
    } catch (error) {
      console.error('Error removing saved job:', error)
      setMessage({ type: 'error', text: 'Failed to remove job' })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading saved jobs...</p>
        </div>
      </div>
    )
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
              className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
            >
              <Search className="w-5 h-5 mr-3" />
              Job Search
            </Link>
            <Link
              href="/job-seeker/saved"
              className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0A2540] mb-8">Saved Jobs</h1>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {savedJobs.length > 0 ? (
              <div className="space-y-4">
                {savedJobs.map((savedJob) => (
                  <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-[#0A2540] mb-1">{savedJob.job.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-[#333333]">
                                <div className="flex items-center">
                                  <Building2 className="w-4 h-4 mr-1" />
                                  {savedJob.job.company}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {savedJob.job.location}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Saved {formatDate(savedJob.saved_at)}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => removeSavedJob(savedJob.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {savedJob.job.skills?.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {savedJob.job.remote && (
                                <Badge className="bg-[#00C49A] text-white text-xs">Remote</Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-[#0A2540]">
                                {formatSalary(savedJob.job.salary_min, savedJob.job.salary_max)}
                              </p>
                              <p className="text-sm text-[#333333]">{savedJob.job.employment_type}</p>
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
                                strokeDasharray="85, 100"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-[#00C49A]">85</span>
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
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#0A2540] mb-2">No Saved Jobs</h3>
                  <p className="text-[#333333] mb-6">Save interesting jobs to come back to them later</p>
                  <Link href="/job-seeker/search">
                    <Button className="bg-[#00C49A] hover:bg-[#00A085]">Find Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
