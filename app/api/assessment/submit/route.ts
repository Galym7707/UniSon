import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    console.log('Assessment submit started')
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)
    const { answers } = await req.json()
    console.log('Received answers:', answers)
    
    // Calculate scores based on answers
    const scores = {
      analytical_thinking: calculateScore(answers, [0, 2, 6, 8]),
      teamwork: calculateScore(answers, [1, 5, 7]),
      creativity: calculateScore(answers, [2, 3]),
      initiative: calculateScore(answers, [3, 4]),
      adaptability: calculateScore(answers, [4, 9]),
      empathy: calculateScore(answers, [5, 6])
    }

    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
    )

    console.log('Calculated scores:', scores)
    console.log('Overall score:', overallScore)

    // Save to profiles table
    const testResults = {
      answers,
      scores,
      overall_score: overallScore,
      completed_at: new Date().toISOString()
    }

    console.log('Saving test results for user:', user.id)
    console.log('Test results data:', testResults)

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        test_results: testResults,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving test results:', error)
      return NextResponse.json({ 
        error: 'Failed to save results', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('Test results saved successfully')
    return NextResponse.json({ success: true, scores, overallScore })
  } catch (error) {
    console.error('Assessment submit error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateScore(answers: number[], questionIndices: number[]): number {
  const relevantAnswers = questionIndices.map(i => answers[i]).filter(a => a > 0)
  if (relevantAnswers.length === 0) return 0
  
  // Convert 1-5 scale to percentage (1=20%, 5=100%)
  const average = relevantAnswers.reduce((sum, val) => sum + val, 0) / relevantAnswers.length
  return Math.round((average / 5) * 100)
} 