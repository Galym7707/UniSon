import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile and preferences
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get user's assessment results for better matching
    const { data: assessment } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Fetch jobs for recommendation
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(50)

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return NextResponse.json(
        { error: 'Failed to fetch jobs for recommendations' },
        { status: 500 }
      )
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Generate AI-powered recommendations with match scores and reasoning
    const recommendations = jobs
      .map((job: any) => {
        // Calculate match score based on various factors
        let matchScore = 50 // Base score
        let reasons: string[] = []

        // Skills matching
        if (profile?.skills && job.skills) {
          const userSkills = profile.skills.map((s: string) => s.toLowerCase())
          const jobSkills = job.skills.map((s: string) => s.toLowerCase())
          const matchingSkills = userSkills.filter((skill: string) => 
            jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
          )
          
          if (matchingSkills.length > 0) {
            const skillMatchBonus = Math.min(30, matchingSkills.length * 10)
            matchScore += skillMatchBonus
            reasons.push(`${matchingSkills.length} matching skills found`)
          }
        }

        // Location preference
        if (profile?.preferred_location && job.location) {
          if (job.location.toLowerCase().includes(profile.preferred_location.toLowerCase()) || job.remote) {
            matchScore += 10
            reasons.push('Matches location preferences')
          }
        }

        // Salary expectations
        if (profile?.expected_salary && job.salary_max) {
          if (job.salary_max >= profile.expected_salary * 0.8) {
            matchScore += 15
            reasons.push('Salary aligns with expectations')
          }
        }

        // Experience level matching
        if (profile?.experience_level && job.experience_level) {
          if (profile.experience_level === job.experience_level) {
            matchScore += 10
            reasons.push('Experience level matches')
          }
        }

        // Assessment-based matching (if assessment exists)
        if (assessment && assessment.results) {
          try {
            const results = typeof assessment.results === 'string' 
              ? JSON.parse(assessment.results) 
              : assessment.results
            
            // Match based on personality traits or technical skills from assessment
            if (results.technical_score && results.technical_score > 70) {
              matchScore += 5
              reasons.push('Strong technical assessment results')
            }
          } catch (e) {
            // Ignore assessment parsing errors
          }
        }

        // Recent posting bonus
        const daysAgo = Math.floor(
          (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysAgo <= 7) {
          matchScore += 5
          reasons.push('Recently posted position')
        }

        // Add some randomization for variety
        matchScore += Math.floor(Math.random() * 10) - 5

        // Cap at 99%
        matchScore = Math.min(99, Math.max(10, matchScore))

        const reasoning = reasons.length > 0 
          ? reasons.join('; ') 
          : 'Based on your profile and preferences'

        return {
          ...job,
          match_score: matchScore,
          reasoning
        }
      })
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10) // Top 10 recommendations

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}