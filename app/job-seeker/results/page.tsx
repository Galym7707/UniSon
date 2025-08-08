// 📁 app/job-seeker/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Brain, Target, Users, Lightbulb, TrendingUp, Heart, Download, Share2, RotateCcw, LayoutDashboard, User, Search, Settings } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

type TestResults = {
  scores: {
    analytical_thinking: number
    teamwork: number
    creativity: number
    initiative: number
    adaptability: number
    empathy: number
  }
  overall_score: number
  completed_at: string
}

export default function PersonalityResults() {
  const [results, setResults] = useState<TestResults | null>(null)
  const [hasExistingResults, setHasExistingResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createBrowserClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        if (!user) throw new Error('User not authenticated')

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('test_results')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        if (data && data.test_results) {
          setResults(data.test_results)
          setHasExistingResults(true)
        } else {
          setHasExistingResults(false)
        }
      } catch (err) {
        logError('results-page', err)
        setError(getUserFriendlyErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-blue-100 text-blue-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const skillCategories = [
    {
      key: 'analytical_thinking',
      name: 'Analytical Thinking',
      icon: Brain,
      description: 'Your ability to analyze information and solve complex problems'
    },
    {
      key: 'teamwork',
      name: 'Teamwork',
      icon: Users,
      description: 'Your collaboration skills and ability to work effectively with others'
    },
    {
      key: 'creativity',
      name: 'Creativity',
      icon: Lightbulb,
      description: 'Your innovative thinking and ability to generate new ideas'
    },
    {
      key: 'initiative',
      name: 'Initiative',
      icon: Target,
      description: 'Your proactive approach and self-motivation'
    },
    {
      key: 'adaptability',
      name: 'Adaptability',
      icon: TrendingUp,
      description: 'Your flexibility and ability to adjust to new situations'
    },
    {
      key: 'empathy',
      name: 'Empathy',
      icon: Heart,
      description: 'Your emotional intelligence and understanding of others'
    }
  ]

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
            <p className="text-[#333333]">Loading your results...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !hasExistingResults) {
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
                  className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
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
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">No Test Results Found</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#0A2540] mb-2">Take the Assessment First</h3>
                    <p className="text-[#333333] mb-6">
                      Complete our psychological assessment to see your personality profile and get personalized job recommendations.
                    </p>
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
                      </div>
                    )}
                    <Link href="/job-seeker/test">
                      <Button className="bg-[#00C49A] hover:bg-[#00A085]">Take Assessment</Button>
                    </Link>
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
                className="flex items-center px-4 py-3 text-[#333333] hover:bg-gray-100 rounded-lg"
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
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#0A2540]">Your Assessment Results</h1>
                <div className="flex space-x-3">
                  <Link href="/job-seeker/test">
                    <Button variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Test
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Overall Score */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Overall Score</CardTitle>
                  <CardDescription>
                    Completed on {new Date(results!.completed_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#00C49A"
                          strokeWidth="3"
                          strokeDasharray={`${results!.overall_score}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-[#00C49A]">{results!.overall_score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Badge className={getScoreColorBg(results!.overall_score)}>
                      {results!.overall_score >= 80 ? 'Excellent' : 
                       results!.overall_score >= 60 ? 'Good' : 
                       results!.overall_score >= 40 ? 'Average' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                {skillCategories.map((category) => {
                  const score = results!.scores[category.key as keyof typeof results.scores]
                  const IconComponent = category.icon
                  
                  return (
                    <Card key={category.key}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-[#0A2540]">
                          <IconComponent className="w-5 h-5 mr-2 text-[#00C49A]" />
                          {category.name}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                          <Badge variant="outline" className={getScoreColor(score)}>
                            {score >= 80 ? 'Strong' : 
                             score >= 60 ? 'Good' : 
                             score >= 40 ? 'Average' : 'Developing'}
                          </Badge>
                        </div>
                        <Progress value={score} className="w-full" />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Actions */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/job-seeker/search">
                      <Button className="w-full bg-[#00C49A] hover:bg-[#00A085]">
                        <Search className="w-4 h-4 mr-2" />
                        Find Matching Jobs
                      </Button>
                    </Link>
                    <Link href="/job-seeker/profile">
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Complete Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Results
                    </Button>
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