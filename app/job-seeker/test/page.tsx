// 📁 app/job-seeker/test/page.tsx
// Updated psychological test page (10 questions, Likert scale)

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

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
    } catch (err) {
      console.error('Error checking existing results:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetakeTest = () => {
    setShowRetakeConfirmation(false)
    setHasExistingResults(false)
  }

  const handleSelect = (val: number) => {
    const newAnswers = [...answers]
    newAnswers[current] = val
    setAnswers(newAnswers)
  }

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    } else {
      setSubmitting(true)
      setError(null)
      
      try {
        console.log('Submitting test answers:', answers)
        const response = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        })

        const result = await response.json()
        console.log('API response:', result)

        if (!response.ok) {
          throw new Error(result.error || result.details || 'Failed to submit test')
        }

        if (result.success) {
          router.push('/job-seeker/results')
        } else {
          throw new Error(result.error || 'Failed to save results')
        }
      } catch (err) {
        console.error('Test submission error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setSubmitting(false)
      }
    }
  }

  const progress = ((current + 1) / questions.length) * 100

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C49A] mx-auto mb-4"></div>
          <p className="text-[#0A2540]">Loading assessment...</p>
        </div>
      </div>
    )
  }

  // Show retake confirmation
  if (showRetakeConfirmation && hasExistingResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-[#0A2540]">
                Assessment Already Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-[#0A2540] mb-2">
                  You have already completed the psychological assessment.
                </p>
                {completedAt && (
                  <p className="text-sm text-gray-600">
                    Completed on: {new Date(completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/job-seeker/results')}
                  className="border-[#00C49A] text-[#00C49A] hover:bg-[#00C49A] hover:text-white"
                >
                  View Current Results
                </Button>
                <Button
                  onClick={handleRetakeTest}
                  className="bg-[#00C49A] hover:bg-[#00A085]"
                >
                  Retake Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Normal test interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-[#0A2540]">
              Psychological Test ({current + 1} / {questions.length})
            </CardTitle>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0A2540]">
              {questions[current].q}
            </h2>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map(value => (
                <Button
                  key={value}
                  variant={answers[current] === value ? 'default' : 'outline'}
                  className="w-12 h-12"
                  onClick={() => handleSelect(value)}
                  disabled={submitting}
                >
                  {value}
                </Button>
              ))}
            </div>
            
            {error && (
              <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="text-center">
              <Button
                className="bg-[#00C49A] hover:bg-[#00A085]"
                disabled={answers[current] === 0 || submitting}
                onClick={handleNext}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : current === questions.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}