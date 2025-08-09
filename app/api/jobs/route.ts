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

    try {
      // Build query - select all columns to handle column mapping
      let query = supabase.from('jobs').select('*')

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,required_skills::text.ilike.%${search}%`)
      }

      if (location && location !== 'remote') {
        query = query.or(`country.ilike.%${location}%,city.ilike.%${location}%`)
      }

      if (remoteOnly) {
        query = query.in('remote_work_option', ['yes', 'hybrid'])
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
        console.error('Database query error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch jobs from database' },
          { status: 500 }
        )
      }

      // Map database columns to frontend expected field names
      const mappedJobs = data?.map((job: any) => {
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

        return {
          ...job,
          // Map database columns to expected frontend fields
          location: location,
          remote: job.remote_work_option || false,
          skills: job.required_skills ? (
            Array.isArray(job.required_skills) 
              ? job.required_skills 
              : typeof job.required_skills === 'string'
                ? job.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
          ) : [],
          // Keep original database fields for any backend processing
          city: job.city,
          country: job.country,
          remote_work_option: job.remote_work_option,
          required_skills: job.required_skills
        }
      }) || []

      // Calculate match scores (simplified placeholder)
      const jobsWithScores = mappedJobs.map((job: any) => ({
        ...job,
        match_score: Math.floor(Math.random() * 30) + 70 // Placeholder match score
      }))

      return NextResponse.json({ jobs: jobsWithScores }, { status: 200 })

    } catch (queryError) {
      console.error('Database query execution error:', queryError)
      return NextResponse.json(
        { error: 'Database query failed during execution' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in jobs API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching jobs' },
      { status: 500 }
    )
  }
}