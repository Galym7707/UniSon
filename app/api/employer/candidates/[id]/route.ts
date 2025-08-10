import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage } from '@/lib/error-handling'

// Middleware to verify employer authentication and role
async function verifyEmployerAuth(supabase: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify user role is employer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Profile lookup error: ${profileError.message}`)
    }

    if (!profile || profile.role !== 'employer') {
      throw new Error('Access denied: Employer role required')
    }

    return { user, profile }
  } catch (error) {
    throw error
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()
  const { id: candidateId } = await params

  try {
    logInfo('employer-candidate-get-start', {
      requestId,
      candidateId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Validate candidate ID format
    if (!candidateId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId)) {
      return NextResponse.json(
        { error: 'Invalid candidate ID format - must be a valid UUID' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseError) {
      logError('employer-candidate-supabase-init', supabaseError, {
        requestId,
        candidateId,
        context: 'Failed to initialize Supabase client'
      })
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    // Verify employer authentication
    let authResult
    try {
      authResult = await verifyEmployerAuth(supabase)
    } catch (authError) {
      logError('employer-candidate-auth', authError, {
        requestId,
        candidateId,
        context: 'Authentication/authorization failed'
      })
      
      const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error'
      if (errorMessage.includes('not authenticated')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      } else if (errorMessage.includes('Access denied')) {
        return NextResponse.json(
          { error: 'Access denied: Employer role required' },
          { status: 403 }
        )
      } else {
        return NextResponse.json(
          { error: 'Authentication verification failed' },
          { status: 401 }
        )
      }
    }

    // Parse query parameters for job filtering
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')

    // If job_id is provided, verify the job belongs to this employer
    if (jobId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
        return NextResponse.json(
          { error: 'Invalid job ID format - must be a valid UUID' },
          { status: 400 }
        )
      }

      try {
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('id, employer_id')
          .eq('id', jobId)
          .eq('employer_id', authResult.user.id)
          .single()

        if (jobError || !job) {
          logError('employer-candidate-job-verification', jobError, {
            requestId,
            candidateId,
            context: 'Job ownership verification failed',
            jobId,
            employerId: authResult.user.id
          })
          return NextResponse.json(
            { error: 'Job not found or access denied' },
            { status: 404 }
          )
        }
      } catch (jobVerificationError) {
        logError('employer-candidate-job-verification', jobVerificationError, {
          requestId,
          candidateId,
          context: 'Job verification error'
        })
        return NextResponse.json(
          { error: 'Failed to verify job access' },
          { status: 500 }
        )
      }
    }

    // Get candidate profile with detailed information
    try {
      const { data: candidate, error: candidateError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          name,
          email,
          title,
          summary,
          skills,
          experience,
          education,
          resume_url,
          location,
          phone,
          linkedin_url,
          portfolio_url,
          created_at,
          updated_at
        `)
        .eq('id', candidateId)
        .eq('role', 'job-seeker')
        .single()

      if (candidateError) {
        logError('employer-candidate-query', candidateError, {
          requestId,
          candidateId,
          context: 'Candidate query failed',
          supabaseError: {
            message: candidateError.message,
            details: candidateError.details,
            hint: candidateError.hint,
            code: candidateError.code
          }
        })

        if (candidateError.code === 'PGRST116') { // No rows found
          return NextResponse.json(
            { error: 'Candidate not found' },
            { status: 404 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Database query failed' 
            : `Database error: ${candidateError.message}` 
          },
          { status: 500 }
        )
      }

      if (!candidate) {
        return NextResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        )
      }

      // Transform candidate data to remove internal fields and format appropriately
      const transformedCandidate = {
        id: candidate.id,
        name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        title: candidate.title,
        summary: candidate.summary,
        skills: candidate.skills,
        experience: candidate.experience,
        education: candidate.education,
        resume_url: candidate.resume_url,
        location: candidate.location,
        phone: candidate.phone,
        linkedin_url: candidate.linkedin_url,
        portfolio_url: candidate.portfolio_url,
        profile_created: candidate.created_at,
        last_updated: candidate.updated_at
      }

      // If job_id was provided, get additional context about applications for that specific job
      let applicationContext = null
      if (jobId) {
        try {
          // This would be extended if we have a job_applications table
          // For now, we'll provide basic context
          applicationContext = {
            job_id: jobId,
            context: 'Candidate viewed in context of specific job posting'
          }
        } catch (contextError) {
          // Log but don't fail the request for context errors
          logError('employer-candidate-context', contextError, {
            requestId,
            candidateId,
            jobId,
            context: 'Failed to get application context'
          })
        }
      }

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-candidate-success', {
        requestId,
        candidateId,
        employerId: authResult.user.id,
        jobId,
        candidateName: transformedCandidate.name,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        {
          success: true,
          candidate: transformedCandidate,
          application_context: applicationContext
        },
        { status: 200 }
      )

    } catch (queryError) {
      logError('employer-candidate-query-error', queryError, {
        requestId,
        candidateId,
        context: 'Candidate retrieval failed'
      })
      return NextResponse.json(
        { error: 'Failed to retrieve candidate information' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-candidate-unexpected', unexpectedError, {
      requestId,
      candidateId,
      context: 'Unexpected error in candidate retrieval API',
      requestDurationMs,
      stack: unexpectedError instanceof Error ? unexpectedError.stack : undefined
    })

    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : getUserFriendlyErrorMessage(unexpectedError)
      },
      { status: 500 }
    )
  }
}