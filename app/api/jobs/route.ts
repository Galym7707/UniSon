import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage, ErrorType } from '@/lib/error-handling'

interface QueryParams {
  search?: string | null
  location?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  employmentTypes?: string[]
  remoteOnly?: boolean
  experienceLevel?: string | null
  sortBy?: string
}

interface QueryMetrics {
  queryStartTime: number
  queryEndTime?: number
  resultCount?: number
  filters: QueryParams
  queryDurationMs?: number
}

export async function GET(request: Request) {
  const queryStartTime = performance.now()
  let queryParams: QueryParams = {}
  let queryMetrics: QueryMetrics = {
    queryStartTime,
    filters: queryParams
  }

  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const salaryMinStr = searchParams.get('salary_min')
    const salaryMaxStr = searchParams.get('salary_max')
    const employmentTypesStr = searchParams.get('employment_types')
    const remoteOnly = searchParams.get('remote_only') === 'true'
    const experienceLevel = searchParams.get('experience_level')
    const sortBy = searchParams.get('sort_by') || 'date'

    // Validate and parse numeric parameters
    let salaryMin: number | null = null
    let salaryMax: number | null = null

    if (salaryMinStr) {
      const parsed = parseInt(salaryMinStr)
      if (isNaN(parsed) || parsed < 0) {
        const validationError = new Error(`Invalid salary_min parameter: ${salaryMinStr}`)
        logError('jobs-api-validation', validationError, {
          parameter: 'salary_min',
          providedValue: salaryMinStr,
          url: request.url
        })
        return NextResponse.json(
          { error: 'Invalid salary_min parameter. Must be a positive number.' },
          { status: 400 }
        )
      }
      salaryMin = parsed
    }

    if (salaryMaxStr) {
      const parsed = parseInt(salaryMaxStr)
      if (isNaN(parsed) || parsed < 0) {
        const validationError = new Error(`Invalid salary_max parameter: ${salaryMaxStr}`)
        logError('jobs-api-validation', validationError, {
          parameter: 'salary_max',
          providedValue: salaryMaxStr,
          url: request.url
        })
        return NextResponse.json(
          { error: 'Invalid salary_max parameter. Must be a positive number.' },
          { status: 400 }
        )
      }
      salaryMax = parsed
    }

    // Validate salary range
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      const validationError = new Error(`Invalid salary range: min (${salaryMin}) > max (${salaryMax})`)
      logError('jobs-api-validation', validationError, {
        salaryMin,
        salaryMax,
        url: request.url
      })
      return NextResponse.json(
        { error: 'Invalid salary range. Minimum salary cannot be greater than maximum salary.' },
        { status: 400 }
      )
    }

    // Parse employment types
    let employmentTypes: string[] | undefined
    if (employmentTypesStr) {
      employmentTypes = employmentTypesStr.split(',').map(type => type.trim()).filter(Boolean)
      if (employmentTypes.length === 0) {
        employmentTypes = undefined
      }
    }

    // Validate sort parameter
    const validSortOptions = ['date', 'salary', 'relevance', 'match']
    if (!validSortOptions.includes(sortBy)) {
      const validationError = new Error(`Invalid sort_by parameter: ${sortBy}`)
      logError('jobs-api-validation', validationError, {
        parameter: 'sort_by',
        providedValue: sortBy,
        validOptions: validSortOptions,
        url: request.url
      })
      return NextResponse.json(
        { error: `Invalid sort_by parameter. Valid options are: ${validSortOptions.join(', ')}` },
        { status: 400 }
      )
    }

    // Store query parameters for logging
    queryParams = {
      search,
      location,
      salaryMin,
      salaryMax,
      employmentTypes,
      remoteOnly,
      experienceLevel,
      sortBy
    }
    queryMetrics.filters = queryParams

    // Log query attempt
    logInfo('jobs-api-query-start', {
      queryId: crypto.randomUUID(),
      filters: queryParams,
      timestamp: new Date().toISOString()
    })

    let supabase
    try {
      supabase = await createRouteHandlerClient()
    } catch (supabaseInitError) {
      logError('jobs-api-supabase-init', supabaseInitError, {
        context: 'Failed to initialize Supabase client',
        url: request.url
      })
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    try {
      // Build query using standardized UUID-based schema column names
      let query = supabase.from('jobs').select('*')

      // Apply filters using correct database column names
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,required_skills::text.ilike.%${search}%`)
      }

      if (location && location !== 'remote') {
        query = query.or(`country.ilike.%${location}%,city.ilike.%${location}%`)
      }

      if (remoteOnly) {
        query = query.in('remote_work_option', ['yes', 'hybrid'])
      }

      if (salaryMin !== null) {
        query = query.gte('salary_min', salaryMin)
      }

      if (salaryMax !== null) {
        query = query.lte('salary_max', salaryMax)
      }

      if (employmentTypes && employmentTypes.length > 0) {
        query = query.in('employment_type', employmentTypes)
      }

      if (experienceLevel) {
        query = query.eq('experience_level', experienceLevel)
      }

      // Apply sorting
      if (sortBy === 'date') {
        query = query.order('posted_at', { ascending: false })
      } else if (sortBy === 'salary') {
        query = query.order('salary_max', { ascending: false })
      } else if (sortBy === 'relevance') {
        // For relevance, we can use a combination of factors or use posted_at as fallback
        query = query.order('posted_at', { ascending: false })
      } else if (sortBy === 'match') {
        // For match sorting, we'll sort by posted_at for now (match scores are added later)
        query = query.order('posted_at', { ascending: false })
      } else {
        // Default: by date
        query = query.order('posted_at', { ascending: false })
      }

      const { data, error } = await query

      queryMetrics.queryEndTime = performance.now()
      queryMetrics.queryDurationMs = queryMetrics.queryEndTime - queryMetrics.queryStartTime
      queryMetrics.resultCount = data?.length || 0

      if (error) {
        logError('jobs-api-database-error', error, {
          queryParams,
          supabaseError: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          queryDurationMs: queryMetrics.queryDurationMs,
          url: request.url
        })

        // Return appropriate error based on Supabase error code
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Invalid query parameters' },
            { status: 400 }
          )
        }
        if (error.code?.startsWith('08')) { // Connection errors
          return NextResponse.json(
            { error: 'Database connection error' },
            { status: 503 }
          )
        }
        if (error.code?.startsWith('42')) { // Schema/column errors
          return NextResponse.json(
            { error: 'Database schema error' },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { error: process.env.NODE_ENV === 'production' 
            ? 'Database error occurred' 
            : `Database error: ${error.message}` 
          },
          { status: 500 }
        )
      }

      // Transform database fields to match frontend expectations
      const transformedJobs = data?.map((job: any) => {
        // Construct location field from city and country
        let location = ''
        if (job.city && job.country) {
          location = `${job.city}, ${job.country}`
        } else if (job.city) {
          location = job.city
        } else if (job.country) {
          location = job.country
        } else {
          location = 'Not specified'
        }

        // Transform required_skills to skills array
        let skills: string[] = []
        if (job.required_skills) {
          if (Array.isArray(job.required_skills)) {
            skills = job.required_skills
          } else if (typeof job.required_skills === 'string') {
            skills = job.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        }

        // Transform remote_work_option to boolean remote field
        const remote = job.remote_work_option === 'yes' || job.remote_work_option === 'hybrid' || job.remote_work_option === true

        return {
          ...job,
          location,
          remote,
          skills
        }
      }) || []

      // Calculate match scores (simplified placeholder)
      const jobsWithScores = transformedJobs.map((job: any) => ({
        ...job,
        match_score: Math.floor(Math.random() * 30) + 70 // Placeholder match score
      }))

      // Apply post-processing sorting for match scores
      let sortedJobs = jobsWithScores
      if (sortBy === 'match') {
        sortedJobs = jobsWithScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      } else if (sortBy === 'relevance') {
        // For relevance, we can sort by a combination of factors
        // For now, using match score as a proxy for relevance
        sortedJobs = jobsWithScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      }

      // Log successful query metrics
      logInfo('jobs-api-query-success', {
        queryParams,
        resultCount: sortedJobs.length,
        queryDurationMs: queryMetrics.queryDurationMs,
        timestamp: new Date().toISOString(),
        performance: {
          fast: queryMetrics.queryDurationMs! < 100,
          acceptable: queryMetrics.queryDurationMs! < 1000,
          slow: queryMetrics.queryDurationMs! >= 1000
        }
      })

      return NextResponse.json({ jobs: sortedJobs }, { status: 200 })

    } catch (queryError) {
      logError('jobs-api-query-execution', queryError, {
        queryParams,
        context: 'Database query execution failed',
        url: request.url,
        queryDurationMs: performance.now() - queryStartTime
      })
      return NextResponse.json(
        { error: 'Database query failed during execution' },
        { status: 500 }
      )
    }

  } catch (unexpectedError) {
    // Catch-all error handler
    const queryDurationMs = performance.now() - queryStartTime
    logError('jobs-api-unexpected-error', unexpectedError, {
      queryParams,
      context: 'Unexpected error in jobs API',
      url: request.url,
      queryDurationMs,
      stack: unexpectedError instanceof Error ? unexpectedError.stack : undefined
    })

    // Return generic error message in production, detailed in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : getUserFriendlyErrorMessage(unexpectedError)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}