import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo, getUserFriendlyErrorMessage, ErrorType } from '@/lib/error-handling'

// Function to calculate match score between job and candidate profile
async function calculateJobMatchScore(job: any, candidateProfile: any): Promise<number> {
  let skillsMatch = 0
  let experienceMatch = 0

  // Calculate skills match
  const jobSkills = Array.isArray(job.required_skills) ? job.required_skills : []
  const candidateSkills = candidateProfile.extracted_skills || []
  
  if (jobSkills.length > 0 && candidateSkills.length > 0) {
    let matchedSkills = 0
    let totalWeight = 0
    
    jobSkills.forEach((requiredSkill: string) => {
      const skillLower = requiredSkill.toLowerCase()
      const candidateSkill = candidateSkills.find((cs: any) => {
        const csName = typeof cs === 'object' ? cs.skill.toLowerCase() : cs.toLowerCase()
        return csName === skillLower || csName.includes(skillLower) || skillLower.includes(csName)
      })
      
      if (candidateSkill) {
        const confidence = typeof candidateSkill === 'object' ? candidateSkill.confidence || 0.8 : 0.8
        matchedSkills += confidence
      }
      totalWeight += 1
    })
    
    skillsMatch = totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0
  } else {
    skillsMatch = candidateSkills.length > 0 ? 50 : 0
  }

  // Calculate experience match
  const jobExpLevel = job.experience_level
  const candidateExpLevel = candidateProfile.experience_level

  if (jobExpLevel && candidateExpLevel) {
    const expLevels = ['entry', 'mid', 'senior', 'lead', 'executive']
    const jobExpIndex = expLevels.indexOf(jobExpLevel)
    const candidateExpIndex = expLevels.indexOf(candidateExpLevel)
    
    if (jobExpIndex >= 0 && candidateExpIndex >= 0) {
      const levelDiff = Math.abs(jobExpIndex - candidateExpIndex)
      if (levelDiff === 0) {
        experienceMatch = 100
      } else if (levelDiff === 1) {
        experienceMatch = 80
      } else if (levelDiff === 2) {
        experienceMatch = 60
      } else {
        experienceMatch = 40
      }
    } else {
      experienceMatch = 50
    }
  } else {
    experienceMatch = 50
  }

  // Calculate overall score (weighted average: 70% skills, 30% experience)
  const overallScore = Math.round((skillsMatch * 0.7) + (experienceMatch * 0.3))
  return Math.max(0, Math.min(100, overallScore))
}

interface QueryParams {
  search?: string | null
  location?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  employmentTypes?: string[]
  experienceLevels?: string[]
  remoteWorkOption?: boolean
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
    const employmentTypesStr = searchParams.get('employment_type')
    const experienceLevelsStr = searchParams.get('experience_level')
    const remoteWorkOption = searchParams.get('remote_work_option') === 'true'
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

    // Parse employment types array
    let employmentTypes: string[] | undefined
    if (employmentTypesStr) {
      employmentTypes = employmentTypesStr.split(',').map(type => type.trim()).filter(Boolean)
      if (employmentTypes.length === 0) {
        employmentTypes = undefined
      }
    }

    // Parse experience levels array
    let experienceLevels: string[] | undefined
    if (experienceLevelsStr) {
      experienceLevels = experienceLevelsStr.split(',').map(level => level.trim()).filter(Boolean)
      if (experienceLevels.length === 0) {
        experienceLevels = undefined
      }
    }

    // Validate sort parameter
    const validSortOptions = ['date', 'salary']
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
      experienceLevels,
      remoteWorkOption,
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

      // Filter by remote work option
      if (remoteWorkOption) {
        query = query.in('remote_work_option', ['yes', 'hybrid'])
      }

      if (salaryMin !== null) {
        query = query.gte('salary_min', salaryMin)
      }

      if (salaryMax !== null) {
        query = query.lte('salary_max', salaryMax)
      }

      // Filter by employment types using IN clause
      if (employmentTypes && employmentTypes.length > 0) {
        query = query.in('employment_type', employmentTypes)
      }

      // Filter by experience levels using IN clause
      if (experienceLevels && experienceLevels.length > 0) {
        query = query.in('experience_level', experienceLevels)
      }

      // Apply sorting
      if (sortBy === 'date') {
        query = query.order('posted_at', { ascending: false })
      } else if (sortBy === 'salary') {
        query = query.order('salary_max', { ascending: false })
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

        // Format salary fields
        const salary_min = job.salary_min || null
        const salary_max = job.salary_max || null

        return {
          ...job,
          location,
          remote,
          skills,
          salary_min,
          salary_max
        }
      }) || []

      // Calculate match scores (simplified placeholder)
      let jobsWithScores = transformedJobs.map((job: any) => ({
        ...job,
        match_score: Math.floor(Math.random() * 30) + 70 // Placeholder match score
      }))

      // Calculate match scores if user is authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Get candidate profile for match scoring
          const { data: candidateProfile } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', user.id)
            .single()
          
          if (candidateProfile) {
            // Calculate match scores for each job
            jobsWithScores = await Promise.all(
              jobsWithScores.map(async (job: any) => {
                try {
                  const matchScore = await calculateJobMatchScore(job, candidateProfile)
                  return {
                    ...job,
                    match_score: matchScore
                  }
                } catch (error) {
                  console.error('Error calculating match score for job:', job.id, error)
                  return job // Keep original score
                }
              })
            )
          }
        }
      } catch (authError) {
        // User not authenticated or other auth error, continue without match scores
        console.log('No authenticated user for match scoring')
      }

      // Log successful query metrics
      logInfo('jobs-api-query-success', {
        queryParams,
        resultCount: jobsWithScores.length,
        queryDurationMs: queryMetrics.queryDurationMs,
        timestamp: new Date().toISOString(),
        performance: {
          fast: queryMetrics.queryDurationMs! < 100,
          acceptable: queryMetrics.queryDurationMs! < 1000,
          slow: queryMetrics.queryDurationMs! >= 1000
        }
      })

      return NextResponse.json({ jobs: jobsWithScores }, { status: 200 })

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
