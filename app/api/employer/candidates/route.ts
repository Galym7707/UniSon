import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage } from '@/lib/error-handling'

interface CandidateFilters {
  job_id?: string
  experience_level?: string
  skills?: string[]
  location?: string
  search?: string
  page?: number
  limit?: number
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

// Parse and validate query parameters
function parseFilters(searchParams: URLSearchParams): CandidateFilters {
  const filters: CandidateFilters = {}
  const errors: string[] = []

  // Job ID filter
  const jobId = searchParams.get('job_id')
  if (jobId) {
    // Basic UUID validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
      errors.push('Invalid job_id format - must be a valid UUID')
    } else {
      filters.job_id = jobId
    }
  }

  // Experience level filter
  const experienceLevel = searchParams.get('experience_level')
  if (experienceLevel) {
    const validLevels = ['entry', 'mid', 'senior', 'lead', 'executive']
    if (!validLevels.includes(experienceLevel)) {
      errors.push(`Invalid experience_level - must be one of: ${validLevels.join(', ')}`)
    } else {
      filters.experience_level = experienceLevel
    }
  }

  // Skills filter
  const skillsParam = searchParams.get('skills')
  if (skillsParam) {
    const skills = skillsParam.split(',').map(s => s.trim()).filter(Boolean)
    if (skills.length === 0) {
      errors.push('Skills parameter cannot be empty')
    } else if (skills.length > 20) {
      errors.push('Cannot filter by more than 20 skills at once')
    } else {
      filters.skills = skills
    }
  }

  // Location filter
  const location = searchParams.get('location')
  if (location && location.trim()) {
    filters.location = location.trim()
  }

  // Search filter
  const search = searchParams.get('search')
  if (search && search.trim()) {
    if (search.length > 100) {
      errors.push('Search query must be 100 characters or less')
    } else {
      filters.search = search.trim()
    }
  }

  // Pagination
  const pageParam = searchParams.get('page')
  if (pageParam) {
    const page = parseInt(pageParam)
    if (isNaN(page) || page < 1) {
      errors.push('Page must be a positive integer')
    } else if (page > 1000) {
      errors.push('Page cannot exceed 1000')
    } else {
      filters.page = page
    }
  } else {
    filters.page = 1
  }

  const limitParam = searchParams.get('limit')
  if (limitParam) {
    const limit = parseInt(limitParam)
    if (isNaN(limit) || limit < 1) {
      errors.push('Limit must be a positive integer')
    } else if (limit > 100) {
      errors.push('Limit cannot exceed 100')
    } else {
      filters.limit = limit
    }
  } else {
    filters.limit = 20
  }

  if (errors.length > 0) {
    throw new Error(`Filter validation errors: ${errors.join('; ')}`)
  }

  return filters
}

// Build candidates query based on filters
async function buildCandidatesQuery(supabase: any, filters: CandidateFilters, employerId: string) {
  try {
    // Base query for job applications
    let query = supabase
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
        resume_url,
        created_at,
        updated_at
      `)
      .eq('role', 'job-seeker')

    // Apply search filter across multiple fields
    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,skills.ilike.%${filters.search}%`
      )
    }

    // Apply skills filter
    if (filters.skills && filters.skills.length > 0) {
      // Use JSONB contains or text search depending on skills column structure
      const skillsConditions = filters.skills.map(skill => `skills.ilike.%${skill}%`).join(',')
      query = query.or(skillsConditions)
    }

    // Apply experience level filter (if stored in a separate field or derived)
    if (filters.experience_level) {
      // This would depend on how experience level is stored in profiles
      // For now, we'll search in the experience field
      query = query.ilike('experience', `%${filters.experience_level}%`)
    }

    // Apply location filter (would need additional location fields in profiles)
    if (filters.location) {
      // This assumes we have location fields in profiles table
      // For now, search in summary or other relevant fields
      query = query.ilike('summary', `%${filters.location}%`)
    }

    // Order by relevance (most recent first)
    query = query.order('updated_at', { ascending: false })

    // Apply pagination
    const offset = (filters.page! - 1) * filters.limit!
    query = query.range(offset, offset + filters.limit! - 1)

    return query
  } catch (error) {
    throw new Error(`Failed to build candidates query: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestStartTime = performance.now()

  try {
    logInfo('employer-candidates-get-start', {
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
      logError('employer-candidates-supabase-init', supabaseError, {
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
      logError('employer-candidates-auth', authError, {
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

    // Parse and validate filters
    let filters
    try {
      const { searchParams } = new URL(request.url)
      filters = parseFilters(searchParams)
    } catch (filterError) {
      logError('employer-candidates-filters', filterError, {
        requestId,
        context: 'Filter validation failed',
        url: request.url
      })
      return NextResponse.json(
        { error: filterError instanceof Error ? filterError.message : 'Filter validation failed' },
        { status: 400 }
      )
    }

    // If job_id is provided, verify the job belongs to this employer
    if (filters.job_id) {
      try {
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('id, employer_id')
          .eq('id', filters.job_id)
          .eq('employer_id', authResult.user.id)
          .single()

        if (jobError || !job) {
          logError('employer-candidates-job-verification', jobError, {
            requestId,
            context: 'Job ownership verification failed',
            jobId: filters.job_id,
            employerId: authResult.user.id
          })
          return NextResponse.json(
            { error: 'Job not found or access denied' },
            { status: 404 }
          )
        }
      } catch (jobVerificationError) {
        logError('employer-candidates-job-verification', jobVerificationError, {
          requestId,
          context: 'Job verification error'
        })
        return NextResponse.json(
          { error: 'Failed to verify job access' },
          { status: 500 }
        )
      }
    }

    // Build and execute candidates query
    try {
      const query = await buildCandidatesQuery(supabase, filters, authResult.user.id)
      const { data: candidates, error: queryError } = await query

      if (queryError) {
        logError('employer-candidates-query', queryError, {
          requestId,
          context: 'Candidates query failed',
          filters,
          supabaseError: {
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code
          }
        })

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Database query failed' 
            : `Database error: ${queryError.message}` 
          },
          { status: 500 }
        )
      }

      // Get total count for pagination (separate query without limit)
      let totalCount = 0
      try {
        let countQuery = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'job-seeker')

        // Apply same filters for count
        if (filters.search) {
          countQuery = countQuery.or(
            `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,skills.ilike.%${filters.search}%`
          )
        }

        if (filters.skills && filters.skills.length > 0) {
          const skillsConditions = filters.skills.map(skill => `skills.ilike.%${skill}%`).join(',')
          countQuery = countQuery.or(skillsConditions)
        }

        if (filters.experience_level) {
          countQuery = countQuery.ilike('experience', `%${filters.experience_level}%`)
        }

        if (filters.location) {
          countQuery = countQuery.ilike('summary', `%${filters.location}%`)
        }

        const { count, error: countError } = await countQuery

        if (!countError && count !== null) {
          totalCount = count
        }
      } catch (countError) {
        // Log but don't fail the request for count errors
        logError('employer-candidates-count', countError, {
          requestId,
          context: 'Failed to get candidates count'
        })
      }

      // Transform candidates data to remove sensitive information
      const transformedCandidates = (candidates || []).map((candidate: any) => ({
        id: candidate.id,
        name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
        email: candidate.email,
        title: candidate.title,
        summary: candidate.summary,
        skills: candidate.skills,
        experience: candidate.experience,
        resume_url: candidate.resume_url,
        profile_created: candidate.created_at,
        last_updated: candidate.updated_at
      }))

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / filters.limit!)
      const hasNextPage = filters.page! < totalPages
      const hasPreviousPage = filters.page! > 1

      const requestDurationMs = performance.now() - requestStartTime

      logInfo('employer-candidates-success', {
        requestId,
        employerId: authResult.user.id,
        filters,
        resultCount: transformedCandidates.length,
        totalCount,
        currentPage: filters.page,
        totalPages,
        requestDurationMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        {
          success: true,
          candidates: transformedCandidates,
          pagination: {
            current_page: filters.page,
            per_page: filters.limit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next_page: hasNextPage,
            has_previous_page: hasPreviousPage
          },
          filters_applied: filters
        },
        { status: 200 }
      )

    } catch (queryBuildError) {
      logError('employer-candidates-query-build', queryBuildError, {
        requestId,
        context: 'Failed to build or execute candidates query',
        filters
      })
      return NextResponse.json(
        { error: 'Failed to retrieve candidates' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    const requestDurationMs = performance.now() - requestStartTime
    logError('employer-candidates-unexpected', unexpectedError, {
      requestId,
      context: 'Unexpected error in candidates API',
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