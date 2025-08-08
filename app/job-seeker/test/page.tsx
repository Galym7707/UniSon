// 📁 app/job-seeker/test/page.tsx
// Updated psychological test page (10 questions, Likert scale)

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, User, Search, Heart, Settings, Brain } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header-landing'
import { Footer } from '@/components/footer'

const questions = [
  { q: 'Before making a decision, I thoroughly analyze all aspects of the problem.' },
  { q: 'I enjoy working in a team to achieve a common goal.' },
  { q: 'I often suggest new and unconventional ideas for solving work tasks.' },
  { q: 'I show initiative and take on new tasks independently without instructions.' },
  { q: 'I quickly adapt to changes in the work environment.' },
  { q: 'I easily understand the emotions and feelings of other people.' },
  { q: 'I can clearly and understandably express my thoughts when communicating with colleagues.' },
  { q: 'I am responsible in fulfilling my duties.' },
  { q: 'I can plan my time and complete tasks on time.' },
  { q: 'In stressful situations, I remain calm and efficient.' }
]

export default function TestPage() {
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0))
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasExistingResults, setHasExistingResults] = useState(false)
  const [showRetakeConfirmation, setShowRetakeConfirmation] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkExistingResults()
  }, [])

  const checkExistingResults = async () => {
    try {
      const response = await fetch('/api/assessment/check')
      const data = await response.json()
      
      if (response.ok) {
        setHasExistingResults(data.hasTestResults)
        setCompletedAt(data.completedAt)
        setShowRetakeConfirmation(data.hasTestResults)
      } else {
        console.error('Failed to check existing results:', data.error)
      }
    } catch (error) {
      console.error('Error checking existing results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    setShowRetakeConfirmation(false)
    setAnswers(Array(10).fill(0))
    setCurrent(0)
  }

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[current] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    }
  }

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/job-seeker/results')
      } else {
        setError(data.message || 'Failed to submit test. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isTestComplete = answers.every(answer => answer > 0)
  const progress = ((current + 1) / questions.length) * 100

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
            <p className="text-[#333333]">Loading assessment...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (showRetakeConfirmation) {
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
                  className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
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
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#0A2540]">You've Already Completed the Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#333333]">
                      You completed the psychological assessment on {new Date(completedAt!).toLocaleDateString()}.
                      Would you like to retake it? This will overwrite your previous results.
                    </p>
                    <div className="flex space-x-4">
                      <Button onClick={handleStartTest} className="bg-[#FF7A00] hover:bg-[#E66A00]">
                        Retake Assessment
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/job-seeker/results')}>
                        View Current Results
                      </Button>
                      <Button variant="ghost" onClick={() => router.push('/job-seeker/dashboard')}>
                        Back to Dashboard
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
                className="flex items-center px-4 py-3 text-[#00C49A] bg-[#00C49A]/10 rounded-lg"
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
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#0A2540] mb-4">Psychological Assessment</h1>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">
                  Question {current + 1} of {questions.length}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A2540]">Question {current + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg text-[#333333]">{questions[current].q}</p>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Rate how much you agree with this statement:</p>
                    {[
                      { value: 1, label: 'Strongly Disagree' },
                      { value: 2, label: 'Disagree' },
                      { value: 3, label: 'Neutral' },
                      { value: 4, label: 'Agree' },
                      { value: 5, label: 'Strongly Agree' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${current}`}
                          value={option.value}
                          checked={answers[current] === option.value}
                          onChange={() => handleAnswer(option.value)}
                          className="w-4 h-4 text-[#00C49A] focus:ring-[#00C49A]"
                        />
                        <span className="text-[#333333]">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={current === 0}
                    >
                      Previous
                    </Button>

                    <div className="space-x-2">
                      {current === questions.length - 1 ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!isTestComplete || submitting}
                          className="bg-[#00C49A] hover:bg-[#00A085]"
                        >
                          {submitting ? 'Submitting...' : 'Submit Test'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={answers[current] === 0}
                          className="bg-[#00C49A] hover:bg-[#00A085]"
                        >
                          Next
                        </Button>
                      )}
                    </div>
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