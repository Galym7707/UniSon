import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const salaryMin = searchParams.get('salary_min')
    const salaryMax = searchParams.get('salary_max')
    const employmentTypes = searchParams.get('employment_types')
    const remoteOnly = searchParams.get('remote_only')
    const experienceLevel = searchParams.get('experience_level')
    const sortBy = searchParams.get('sort_by') || 'date'
    
    const supabase = await createServerSupabase()
    
    let query = supabase
      .from('jobs')
      .select('*')

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,skills.ilike.%${search}%`)
    }

    if (location && location !== 'remote') {
      query = query.eq('location', location)
    }

    if (remoteOnly === 'true') {
      query = query.eq('remote', true)
    }

    if (salaryMin) {
      query = query.gte('salary_min', parseInt(salaryMin))
    }

    if (salaryMax) {
      query = query.lte('salary_max', parseInt(salaryMax))
    }

    if (employmentTypes) {
      const types = employmentTypes.split(',')
      query = query.in('employment_type', types)
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
      // Default: by posted date
      query = query.order('posted_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    // Add match scores (placeholder for now)
    const jobsWithScores = data?.map((job: any) => ({
      ...job,
      match_score: Math.floor(Math.random() * 30) + 70
    })) || []

    return NextResponse.json(jobsWithScores)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}