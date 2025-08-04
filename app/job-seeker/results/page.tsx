// 📁 app/job-seeker/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Brain, Target, Users, Lightbulb, TrendingUp, Heart, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from '@/lib/supabase/browser'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

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

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (data?.test_results) {
          setResults(data.test_results)
        }
      } catch (err) {
        const errorMessage = getUserFriendlyErrorMessage(err)
        logError('personality-results', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [])

  const retryLoadResults = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-[#333333]">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorDisplay 
            error={error}
            onRetry={retryLoadResults}
            variant="card"
          />
          <div className="text-center mt-4">
            <Link href="/job-seeker/test">
              <Button className="bg-[#00C49A] hover:bg-[#00A085]">Take Test</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#333333] mb-4">No test results found</p>
          <Link href="/job-seeker/test">
            <Button className="bg-[#00C49A] hover:bg-[#00A085]">Take Test</Button>
          </Link>
        </div>
      </div>
    )
  }

  const personalityTraits = [
    { name: "Analytical Thinking", score: results.scores.analytical_thinking, icon: Brain, color: "bg-blue-500" },
    { name: "Teamwork", score: results.scores.teamwork, icon: Users, color: "bg-green-500" },
    { name: "Initiative", score: results.scores.initiative, icon: Target, color: "bg-purple-500" },
    { name: "Creativity", score: results.scores.creativity, icon: Lightbulb, color: "bg-yellow-500" },
    { name: "Adaptability", score: results.scores.adaptability, icon: TrendingUp, color: "bg-orange-500" },
    { name: "Empathy", score: results.scores.empathy, icon: Heart, color: "bg-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/job-seeker/dashboard" className="text-2xl font-bold text-[#0A2540]">
            Unison AI
          </Link>
          <p className="text-[#333333] mt-2">Personality Analysis Results</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-[#0A2540]">Your Strengths</CardTitle>
                <CardDescription className="text-lg">Analysis based on your answers and experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-[#00C49A] to-[#FF7A00] text-white text-4xl font-bold mb-4">
                    {results.overall_score}%
                  </div>
                  <p className="text-[#333333] text-lg">Overall IT field compatibility score</p>
                </div>
              </CardContent>
            </Card>

            {/* Personality Traits */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Detailed Personality Analysis</CardTitle>
                <CardDescription>Your key characteristics and their impact on work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {personalityTraits.map((trait) => {
                    const Icon = trait.icon
                    return (
                      <div key={trait.name} className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${trait.color} text-white`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0A2540]">{trait.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Progress value={trait.score} className="flex-1 h-2" />
                              <span className="text-sm font-medium text-[#333333]">{trait.score}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Problem Solving Style */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Problem Solving Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-[#00C49A]/10 to-[#FF7A00]/10 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-8 h-8 text-[#00C49A]" />
                    <h3 className="text-xl font-semibold text-[#0A2540]">Analytical Approach</h3>
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    You prefer to thoroughly analyze problems, gather data, and make informed decisions.
                    Your approach to problem-solving is based on logic and facts, making you a valuable
                    specialist in technical projects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Work Style */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Preferred Work Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-[#00C49A]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#00C49A]" />
                  <span className="font-medium text-[#0A2540]">Team Player</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <Target className="w-6 h-6 text-gray-500" />
                  <span className="text-[#333333]">Independent Specialist</span>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Factors */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Motivational Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="w-full justify-center py-2 bg-[#00C49A] text-white">Professional Growth</Badge>
                  <Badge className="w-full justify-center py-2 bg-[#FF7A00] text-white">Interesting Tasks</Badge>
                  <Badge className="w-full justify-center py-2 bg-[#0A2540] text-white">Teamwork</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#0A2540]">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#00C49A] hover:bg-[#00A085]">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white bg-transparent"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Link href="/job-seeker/search" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Find Suitable Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}