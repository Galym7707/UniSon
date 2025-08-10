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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()
  const { id: jobId } = await params

  try {
    logInfo('employer-job-delete-start', {
      requestId,
      jobId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Validate job ID format
    if (!jobId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID format - must be a valid UUID' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseError) {
      logError('employer-job-delete-supabase-init', supabaseError, {
        requestId,
        jobId,
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
      logError('employer-job-delete-auth', authError, {
        requestId,
        jobId,
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

    // Verify job ownership before deletion
    try {
      const { data: existingJob, error: jobError } = await supabase
        .from('jobs')
        .select('id, employer_id, title, company')
        .eq('id', jobId)
        .single()

      if (jobError) {
        logError('employer-job-delete-job-lookup', jobError, {
          requestId,
          jobId,
          context: 'Job lookup failed',
          supabaseError: {
            message: jobError.message,
            details: jobError.details,
            hint: jobError.hint,
            code: jobError.code
          }
        })

        if (jobError.code === 'PGRST116') { // No rows found
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          )
        }

        return NextResponse.json(
          { error: 'Failed to verify job ownership' },
          { status: 500 }
        )
      }

      if (existingJob.employer_id !== authResult.user.id) {
        logError('employer-job-delete-ownership', new Error('Job ownership mismatch'), {
          requestId,
          jobId,
          employerId: authResult.user.id,
          jobEmployerId: existingJob.employer_id,
          context: 'User does not own this job'
        })
        return NextResponse.json(
          { error: 'Access denied: You can only delete your own jobs' },
          { status: 403 }
        )
      }

      // Store job info for logging before deletion
      const jobInfo = {
        title: existingJob.title,
        company: existingJob.company
      }

      // Delete the job
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('employer_id', authResult.user.id) // Double-check ownership

      if (deleteError) {
        logError('employer-job-delete-db-delete', deleteError, {
          requestId,
          jobId,
          context: 'Database deletion failed',
          supabaseError: {
            message: deleteError.message,
            details: deleteError.details,
            hint: deleteError.hint,
            code: deleteError.code
          }
        })

        // Handle specific database errors
        if (deleteError.code === 'PGRST116') { // No rows found
          return NextResponse.json(
            { error: 'Job not found or access denied' },
            { status: 404 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Failed to delete job' 
            : `Database error: ${deleteError.message}` 
          },
          { status: 500 }
        )
      }

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-job-delete-success', {
        requestId,
        jobId,
        employerId: authResult.user.id,
        deletedJob: jobInfo,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { 
          success: true,
          message: 'Job deleted successfully'
        },
        { status: 200 }
      )

    } catch (ownershipError) {
      logError('employer-job-delete-ownership-error', ownershipError, {
        requestId,
        jobId,
        context: 'Job ownership verification or deletion failed'
      })
      return NextResponse.json(
        { error: 'Failed to verify job ownership or delete job' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-job-delete-unexpected', unexpectedError, {
      requestId,
      jobId,
      context: 'Unexpected error in job deletion API',
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