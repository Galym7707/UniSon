"use client"

import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Progress,
} from "@/components/ui"

import {
  LayoutDashboard, User, Search, Heart, Settings, TrendingUp, Bell, Star, Building2, MapPin, Calendar, Users, Brain,
} from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/browser"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { getUserFriendlyErrorMessage } from "@/lib/error-handling"
import JobSeekerLayout from "@/components/JobSeekerLayout"
import { useActivityLogs } from "@/hooks/use-activity-logs"
import { ActivityFeed } from "@/components/activity-feed"

interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  match_score: number
  reasoning: string
}

const RecommendedJobs = ({ recommendations, loading }: { recommendations: JobRecommendation[], loading: boolean }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border-l-2 border-gray-200 pl-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded mb-1 w-1/2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 mb-2">
          <Star className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-sm text-gray-600">
          Complete your profile to get personalized job recommendations
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((job) => (
        <div key={job.id} className="border-l-2 border-purple-200 pl-3 pb-3 border-b border-gray-100 last:border-b-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex-1">{job.title}</h4>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full ml-2">
              {job.match_score}% match
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Building2 className="h-3 w-3" />
            {job.company}
            <MapPin className="h-3 w-3 ml-2" />
            {job.location}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{job.reasoning}</p>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createBrowserClient()
  const pathname = usePathname()

  /* ─────── state ─────── */
  const [profilePct, setProfilePct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  
  /* ─────── activity logs ─────── */
  const { activities, loading: activitiesLoading } = useActivityLogs()

  /* ─────── effects ─────── */
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Calculate profile completeness
        setProfilePct(35)
        
        // Fetch job recommendations
        await fetchRecommendations()
        
        setLoading(false)
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError(getUserFriendlyErrorMessage(err))
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [])

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true)
    try {
      const response = await fetch('/api/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } else {
        console.error('Failed to fetch recommendations:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  /* ─────── loading/error states ─────── */
  if (loading) {
    return (
      <JobSeekerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </JobSeekerLayout>
    )
  }

  if (error) {
    return (
      <JobSeekerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <ErrorDisplay error={error} />
        </div>
      </JobSeekerLayout>
    )
  }

  /* ─────── render ─────── */
  return (
    <JobSeekerLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to Your Job Search Dashboard</h1>
          <p className="text-purple-100">Find your perfect job match with AI-powered recommendations</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Take AI Assessment</h3>
                  <p className="text-sm text-gray-600">Get personalized job matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-md">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Explore new opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-md">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Update Profile</h3>
                  <p className="text-sm text-gray-600">Complete your information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile completeness</span>
                <span>{profilePct}%</span>
              </div>
              <Progress value={profilePct} className="h-2" />
              <p className="text-sm text-gray-600">
                Complete your profile to get better job recommendations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommended Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendedJobs 
                recommendations={recommendations} 
                loading={recommendationsLoading} 
              />
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} loading={activitiesLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </JobSeekerLayout>
  )
}