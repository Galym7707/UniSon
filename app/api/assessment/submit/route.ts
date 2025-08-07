import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for test results data
const answersSchema = z.object({
  answers: z.array(z.number().min(1).max(5)).length(10)
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { 
          error: 'Authentication failed', 
          code: 'AUTH_FAILED',
          details: authError.message 
        }, 
        { status: 401 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not authenticated', 
          code: 'USER_NOT_FOUND' 
        }, 
        { status: 401 }
      )
    }

    // Validate request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body', 
          code: 'INVALID_JSON' 
        }, 
        { status: 400 }
      )
    }

    // Validate answers structure
    const validation = answersSchema.safeParse(requestBody)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid test results data structure', 
          code: 'VALIDATION_ERROR',
          details: validation.error.issues
        }, 
        { status: 400 }
      )
    }

    const { answers } = validation.data

    // Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, test_results')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking user profile:', profileError)
      return NextResponse.json(
        { 
          error: 'Database error while checking user profile', 
          code: 'PROFILE_CHECK_ERROR',
          details: profileError.message 
        }, 
        { status: 500 }
      )
    }

    if (!existingProfile) {
      return NextResponse.json(
        { 
          error: 'User profile not found. Please complete your profile setup first.', 
          code: 'PROFILE_NOT_FOUND' 
        }, 
        { status: 404 }
      )
    }

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

    // Prepare test results data
    const testResults = {
      answers,
      scores,
      overall_score: overallScore,
      completed_at: new Date().toISOString(),
      ...(existingProfile.test_results && {
        previous_attempts: (existingProfile.test_results?.previous_attempts || 0) + 1
      })
    }

    // Implement upsert pattern - update existing test results
    const { data, error } = await supabase
      .from('profiles')
      .update({
        test_results: testResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('Error saving test results:', error)
      
      // Handle specific database constraint violations
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { 
            error: 'Duplicate entry detected', 
            code: 'DUPLICATE_ENTRY',
            details: error.message 
          }, 
          { status: 409 }
        )
      }
      
      if (error.code === '23503') { // Foreign key constraint violation
        return NextResponse.json(
          { 
            error: 'Referenced record does not exist', 
            code: 'FOREIGN_KEY_VIOLATION',
            details: error.message 
          }, 
          { status: 400 }
        )
      }
      
      if (error.code === '23514') { // Check constraint violation
        return NextResponse.json(
          { 
            error: 'Data violates database constraints', 
            code: 'CONSTRAINT_VIOLATION',
            details: error.message 
          }, 
          { status: 400 }
        )
      }

      // Handle connection and timeout errors
      if (error.message?.includes('connection') || error.message?.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed. Please try again.', 
            code: 'DATABASE_CONNECTION_ERROR' 
          }, 
          { status: 503 }
        )
      }

      // Generic database error
      return NextResponse.json(
        { 
          error: 'Failed to save test results', 
          code: 'DATABASE_ERROR',
          details: error.message 
        }, 
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update test results - no rows affected', 
          code: 'UPDATE_FAILED' 
        }, 
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      data: {
        scores, 
        overallScore,
        isUpdate: !!existingProfile.test_results,
        previousAttempts: testResults.previous_attempts || 0,
        completedAt: testResults.completed_at
      }
    })
  } catch (error) {
    console.error('Assessment submit error:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request', 
          code: 'MALFORMED_JSON' 
        }, 
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

function calculateScore(answers: number[], questionIndices: number[]): number {
  const relevantAnswers = questionIndices.map(i => answers[i]).filter(a => a > 0)
  if (relevantAnswers.length === 0) return 0
  
  // Convert 1-5 scale to percentage (1=20%, 5=100%)
  const average = relevantAnswers.reduce((sum, val) => sum + val, 0) / relevantAnswers.length
  return Math.round((average / 5) * 100)
} 