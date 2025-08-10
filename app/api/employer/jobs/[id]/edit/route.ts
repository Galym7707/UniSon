import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage } from '@/lib/error-handling'

// Validation schemas
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'] as const
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'] as const
const REMOTE_WORK_OPTIONS = ['yes', 'no', 'hybrid'] as const

interface JobUpdateRequest {
  title?: string
  description?: string
  company?: string
  country?: string
  city?: string
  employment_type?: string
  experience_level?: string
  salary_min?: number
  salary_max?: number
  required_skills?: string[]
  remote_work_option?: string
}

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

// Validate job update data
function validateJobUpdateData(data: any): JobUpdateRequest {
  const errors: string[] = []
  const validatedData: JobUpdateRequest = {}

  // Title validation
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string')
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty')
    } else if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less')
    } else {
      validatedData.title = data.title.trim()
    }
  }

  // Description validation
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string')
    } else if (data.description.trim().length === 0) {
      errors.push('Description cannot be empty')
    } else if (data.description.length > 5000) {
      errors.push('Description must be 5000 characters or less')
    } else {
      validatedData.description = data.description.trim()
    }
  }

  // Company validation
  if (data.company !== undefined) {
    if (typeof data.company !== 'string') {
      errors.push('Company must be a string')
    } else if (data.company.trim().length === 0) {
      errors.push('Company cannot be empty')
    } else if (data.company.length > 100) {
      errors.push('Company name must be 100 characters or less')
    } else {
      validatedData.company = data.company.trim()
    }
  }

  // Country validation
  if (data.country !== undefined) {
    if (typeof data.country !== 'string') {
      errors.push('Country must be a string')
    } else if (data.country.trim().length === 0) {
      errors.push('Country cannot be empty')
    } else {
      validatedData.country = data.country.trim()
    }
  }

  // City validation
  if (data.city !== undefined) {
    if (typeof data.city !== 'string') {
      errors.push('City must be a string')
    } else if (data.city.trim().length === 0) {
      errors.push('City cannot be empty')
    } else {
      validatedData.city = data.city.trim()
    }
  }

  // Employment type validation
  if (data.employment_type !== undefined) {
    if (!EMPLOYMENT_TYPES.includes(data.employment_type)) {
      errors.push(`Employment type must be one of: ${EMPLOYMENT_TYPES.join(', ')}`)
    } else {
      validatedData.employment_type = data.employment_type
    }
  }

  // Experience level validation
  if (data.experience_level !== undefined) {
    if (!EXPERIENCE_LEVELS.includes(data.experience_level)) {
      errors.push(`Experience level must be one of: ${EXPERIENCE_LEVELS.join(', ')}`)
    } else {
      validatedData.experience_level = data.experience_level
    }
  }

  // Remote work option validation
  if (data.remote_work_option !== undefined) {
    if (!REMOTE_WORK_OPTIONS.includes(data.remote_work_option)) {
      errors.push(`Remote work option must be one of: ${REMOTE_WORK_OPTIONS.join(', ')}`)
    } else {
      validatedData.remote_work_option = data.remote_work_option
    }
  }

  // Salary validation
  if (data.salary_min !== undefined) {
    const salaryMin = Number(data.salary_min)
    if (isNaN(salaryMin) || salaryMin < 0) {
      errors.push('Minimum salary must be a non-negative number')
    } else {
      validatedData.salary_min = salaryMin
    }
  }

  if (data.salary_max !== undefined) {
    const salaryMax = Number(data.salary_max)
    if (isNaN(salaryMax) || salaryMax < 0) {
      errors.push('Maximum salary must be a non-negative number')
    } else {
      validatedData.salary_max = salaryMax
    }
  }

  // Cross-field salary validation
  if (validatedData.salary_min !== undefined && validatedData.salary_max !== undefined && 
      validatedData.salary_min > validatedData.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary')
  }

  // Skills validation
  if (data.required_skills !== undefined) {
    if (!Array.isArray(data.required_skills)) {
      errors.push('Required skills must be an array of strings')
    } else if (data.required_skills.some((skill: any) => typeof skill !== 'string' || skill.trim().length === 0)) {
      errors.push('All required skills must be non-empty strings')
    } else if (data.required_skills.length > 20) {
      errors.push('Cannot have more than 20 required skills')
    } else {
      validatedData.required_skills = data.required_skills
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join('; ')}`)
  }

  // Check if any fields were provided
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update')
  }

  return validatedData
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()
  const { id: jobId } = await params

  try {
    logInfo('employer-job-update-start', {
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
      logError('employer-job-update-supabase-init', supabaseError, {
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
      logError('employer-job-update-auth', authError, {
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

    // Verify job ownership
    try {
      const { data: existingJob, error: jobError } = await supabase
        .from('jobs')
        .select('id, employer_id, title, company')
        .eq('id', jobId)
        .single()

      if (jobError) {
        logError('employer-job-update-job-lookup', jobError, {
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
        logError('employer-job-update-ownership', new Error('Job ownership mismatch'), {
          requestId,
          jobId,
          employerId: authResult.user.id,
          jobEmployerId: existingJob.employer_id,
          context: 'User does not own this job'
        })
        return NextResponse.json(
          { error: 'Access denied: You can only edit your own jobs' },
          { status: 403 }
        )
      }
    } catch (ownershipError) {
      logError('employer-job-update-ownership-error', ownershipError, {
        requestId,
        jobId,
        context: 'Job ownership verification failed'
      })
      return NextResponse.json(
        { error: 'Failed to verify job ownership' },
        { status: 500 }
      )
    }

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      logError('employer-job-update-parse', parseError, {
        requestId,
        jobId,
        context: 'Failed to parse request body'
      })
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate job update data
    let validatedData
    try {
      validatedData = validateJobUpdateData(requestBody)
    } catch (validationError) {
      logError('employer-job-update-validation', validationError, {
        requestId,
        jobId,
        context: 'Job update data validation failed',
        requestBody
      })
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Validation failed' },
        { status: 400 }
      )
    }

    // Update job in database
    try {
      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update(validatedData)
        .eq('id', jobId)
        .eq('employer_id', authResult.user.id) // Double-check ownership
        .select()
        .single()

      if (updateError) {
        logError('employer-job-update-db-update', updateError, {
          requestId,
          jobId,
          context: 'Database update failed',
          validatedData,
          supabaseError: {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          }
        })

        // Handle specific database errors
        if (updateError.code === 'PGRST116') { // No rows found
          return NextResponse.json(
            { error: 'Job not found or access denied' },
            { status: 404 }
          )
        } else if (updateError.code?.startsWith('23')) { // Constraint violations
          return NextResponse.json(
            { error: 'Data constraint violation' },
            { status: 400 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Failed to update job' 
            : `Database error: ${updateError.message}` 
          },
          { status: 500 }
        )
      }

      if (!updatedJob) {
        logError('employer-job-update-no-result', new Error('No job returned after update'), {
          requestId,
          jobId,
          context: 'Job update succeeded but no data returned'
        })
        return NextResponse.json(
          { error: 'Job update failed - no data returned' },
          { status: 500 }
        )
      }

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-job-update-success', {
        requestId,
        jobId,
        employerId: authResult.user.id,
        updatedFields: Object.keys(validatedData),
        title: updatedJob.title,
        company: updatedJob.company,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { 
          success: true,
          job: updatedJob,
          message: 'Job updated successfully'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logError('employer-job-update-db-error', dbError, {
        requestId,
        jobId,
        context: 'Database operation failed',
        validatedData
      })
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-job-update-unexpected', unexpectedError, {
      requestId,
      jobId,
      context: 'Unexpected error in job update API',
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