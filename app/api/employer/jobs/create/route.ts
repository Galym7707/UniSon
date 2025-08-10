import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage } from '@/lib/error-handling'

// Validation schemas
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'] as const
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'] as const
const REMOTE_WORK_OPTIONS = ['yes', 'no', 'hybrid'] as const

interface JobPostRequest {
  title: string
  description: string
  company: string
  country: string
  city: string
  employment_type: string
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

// Validate job posting data
function validateJobData(data: any): JobPostRequest {
  const errors: string[] = []

  // Required fields validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string')
  } else if (data.title.length > 200) {
    errors.push('Title must be 200 characters or less')
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string')
  } else if (data.description.length > 5000) {
    errors.push('Description must be 5000 characters or less')
  }

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
    errors.push('Company name is required and must be a non-empty string')
  } else if (data.company.length > 100) {
    errors.push('Company name must be 100 characters or less')
  }

  if (!data.country || typeof data.country !== 'string' || data.country.trim().length === 0) {
    errors.push('Country is required and must be a non-empty string')
  }

  if (!data.city || typeof data.city !== 'string' || data.city.trim().length === 0) {
    errors.push('City is required and must be a non-empty string')
  }

  if (!data.employment_type || !EMPLOYMENT_TYPES.includes(data.employment_type)) {
    errors.push(`Employment type is required and must be one of: ${EMPLOYMENT_TYPES.join(', ')}`)
  }

  // Optional field validation
  if (data.experience_level && !EXPERIENCE_LEVELS.includes(data.experience_level)) {
    errors.push(`Experience level must be one of: ${EXPERIENCE_LEVELS.join(', ')}`)
  }

  if (data.remote_work_option && !REMOTE_WORK_OPTIONS.includes(data.remote_work_option)) {
    errors.push(`Remote work option must be one of: ${REMOTE_WORK_OPTIONS.join(', ')}`)
  }

  // Salary validation
  if (data.salary_min !== undefined) {
    const salaryMin = Number(data.salary_min)
    if (isNaN(salaryMin) || salaryMin < 0) {
      errors.push('Minimum salary must be a non-negative number')
    } else {
      data.salary_min = salaryMin
    }
  }

  if (data.salary_max !== undefined) {
    const salaryMax = Number(data.salary_max)
    if (isNaN(salaryMax) || salaryMax < 0) {
      errors.push('Maximum salary must be a non-negative number')
    } else {
      data.salary_max = salaryMax
    }
  }

  if (data.salary_min !== undefined && data.salary_max !== undefined && data.salary_min > data.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary')
  }

  // Skills validation
  if (data.required_skills) {
    if (!Array.isArray(data.required_skills)) {
      errors.push('Required skills must be an array of strings')
    } else if (data.required_skills.some((skill: any) => typeof skill !== 'string' || skill.trim().length === 0)) {
      errors.push('All required skills must be non-empty strings')
    } else if (data.required_skills.length > 20) {
      errors.push('Cannot have more than 20 required skills')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join('; ')}`)
  }

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    company: data.company.trim(),
    country: data.country.trim(),
    city: data.city.trim(),
    employment_type: data.employment_type,
    experience_level: data.experience_level || 'mid',
    salary_min: data.salary_min,
    salary_max: data.salary_max,
    required_skills: data.required_skills || [],
    remote_work_option: data.remote_work_option || 'no'
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()

  try {
    logInfo('employer-job-create-start', {
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Initialize Supabase client
    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseError) {
      logError('employer-job-create-supabase-init', supabaseError, {
        requestId,
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
      logError('employer-job-create-auth', authError, {
        requestId,
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

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      logError('employer-job-create-parse', parseError, {
        requestId,
        context: 'Failed to parse request body'
      })
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate job data
    let validatedData
    try {
      validatedData = validateJobData(requestBody)
    } catch (validationError) {
      logError('employer-job-create-validation', validationError, {
        requestId,
        context: 'Job data validation failed',
        requestBody
      })
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Validation failed' },
        { status: 400 }
      )
    }

    // Insert job into database
    try {
      const jobData = {
        employer_id: authResult.user.id,
        title: validatedData.title,
        company: validatedData.company,
        description: validatedData.description,
        country: validatedData.country,
        city: validatedData.city,
        employment_type: validatedData.employment_type,
        experience_level: validatedData.experience_level,
        salary_min: validatedData.salary_min || null,
        salary_max: validatedData.salary_max || null,
        required_skills: validatedData.required_skills,
        remote_work_option: validatedData.remote_work_option
      }

      const { data: insertedJob, error: insertError } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (insertError) {
        logError('employer-job-create-db-insert', insertError, {
          requestId,
          context: 'Database insertion failed',
          jobData,
          supabaseError: {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          }
        })

        // Handle specific database errors
        if (insertError.code === '23503') { // Foreign key constraint
          return NextResponse.json(
            { error: 'Invalid employer reference' },
            { status: 400 }
          )
        } else if (insertError.code === '23505') { // Unique constraint
          return NextResponse.json(
            { error: 'Duplicate job posting detected' },
            { status: 409 }
          )
        } else if (insertError.code?.startsWith('23')) { // Other constraint violations
          return NextResponse.json(
            { error: 'Data constraint violation' },
            { status: 400 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Failed to create job posting' 
            : `Database error: ${insertError.message}` 
          },
          { status: 500 }
        )
      }

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-job-create-success', {
        requestId,
        jobId: insertedJob.id,
        employerId: authResult.user.id,
        title: validatedData.title,
        company: validatedData.company,
        location: `${validatedData.city}, ${validatedData.country}`,
        employment_type: validatedData.employment_type,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { 
          success: true,
          job: insertedJob,
          message: 'Job posted successfully'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logError('employer-job-create-db-error', dbError, {
        requestId,
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
    logError('employer-job-create-unexpected', unexpectedError, {
      requestId,
      context: 'Unexpected error in job posting API',
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