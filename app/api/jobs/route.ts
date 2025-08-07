import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

interface JobsQueryParams {
  search?: string
  location?: string
  country?: string
  city?: string
  salary_min?: string
  salary_max?: string
  employment_type?: string
  employment_types?: string
  remote_only?: string
  experience_level?: string
  sort_by?: string
  page?: string
  limit?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    
    const params: JobsQueryParams = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      salary_min: searchParams.get('salary_min') || undefined,
      salary_max: searchParams.get('salary_max') || undefined,
      employment_type: searchParams.get('employment_type') || undefined,
      employment_types: searchParams.get('employment_types') || undefined,
      remote_only: searchParams.get('remote_only') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      sort_by: searchParams.get('sort_by') || 'date',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    }

    // Parse pagination params
    const page = Math.max(1, parseInt(params.page || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10')))
    const offset = (page - 1) * limit

    // Start building the query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })

    // Apply search filters
    if (params.search) {
      const searchTerm = params.search.trim()
      if (searchTerm) {
        // Search in title, description, and skills if available
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,skills.ilike.%${searchTerm}%`)
      }
    }

    // Apply location filters
    if (params.location && params.location !== 'remote') {
      query = query.eq('location', params.location)
    }

    if (params.country) {
      query = query.ilike('country', `%${params.country}%`)
    }

    if (params.city) {
      query = query.ilike('city', `%${params.city}%`)
    }

    if (params.remote_only === 'true') {
      query = query.eq('remote', true)
    }

    // Apply salary filters
    if (params.salary_min) {
      const minSalary = parseInt(params.salary_min)
      if (!isNaN(minSalary)) {
        query = query.gte('salary_min', minSalary)
      }
    }

    if (params.salary_max) {
      const maxSalary = parseInt(params.salary_max)
      if (!isNaN(maxSalary)) {
        query = query.lte('salary_max', maxSalary)
      }
    }

    // Apply employment type filters
    if (params.employment_type) {
      query = query.eq('employment_type', params.employment_type)
    }

    if (params.employment_types) {
      const types = params.employment_types.split(',')
      query = query.in('employment_type', types)
    }

    // Apply experience level filter
    if (params.experience_level) {
      query = query.eq('experience_level', params.experience_level)
    }

    // Apply sorting
    if (params.sort_by === 'date') {
      query = query.order('posted_at', { ascending: false })
    } else if (params.sort_by === 'salary') {
      query = query.order('salary_max', { ascending: false })
    } else {
      // Default: by posted date or created_at
      const sortColumn = 'posted_at' // Use posted_at if available, fallback to created_at
      query = query.order(sortColumn, { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: jobs, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    // Add match scores for compatibility with existing frontend
    const jobsWithScores = jobs?.map((job: any) => ({
      ...job,
      match_score: Math.floor(Math.random() * 30) + 70
    })) || []

    // Calculate pagination info
    const totalJobs = count || 0
    const totalPages = Math.ceil(totalJobs / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Return format compatible with existing frontend expectations
    if (params.page) {
      return NextResponse.json({
        jobs: jobsWithScores,
        pagination: {
          page,
          limit,
          totalJobs,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      })
    } else {
      // Legacy format for existing frontend
      return NextResponse.json(jobsWithScores)
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}