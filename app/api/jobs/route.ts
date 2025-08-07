import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get search parameters
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const salaryMin = searchParams.get('salary_min')
    const salaryMax = searchParams.get('salary_max')
    const employmentTypes = searchParams.get('employment_types')?.split(',')
    const remoteOnly = searchParams.get('remote_only') === 'true'
    const experienceLevel = searchParams.get('experience_level')
    const sortBy = searchParams.get('sort_by') || 'date'

    const supabase = await createRouteHandlerClient()

    // Build query
    let query = supabase.from('jobs').select('*')

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,skills.ilike.%${search}%`)
    }

    if (location && location !== 'remote') {
      query = query.eq('location', location)
    }

    if (remoteOnly) {
      query = query.eq('remote', true)
    }

    if (salaryMin) {
      query = query.gte('salary_min', parseInt(salaryMin))
    }

    if (salaryMax) {
      query = query.lte('salary_max', parseInt(salaryMax))
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
    } else {
      // Default: by date
      query = query.order('posted_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    // Calculate match scores (simplified placeholder)
    const jobsWithScores = data?.map((job: any) => ({
      ...job,
      match_score: Math.floor(Math.random() * 30) + 70 // Placeholder match score
    })) || []

    return NextResponse.json({ jobs: jobsWithScores }, { status: 200 })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}