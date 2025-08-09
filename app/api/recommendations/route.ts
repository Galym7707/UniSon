import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError } from '@/lib/error-handling'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

interface UserProfile {
  skills: string[]
  experience: string
  preferences: {
    location?: string
    employment_type?: string[]
    salary_range?: { min?: number; max?: number }
    remote_work?: boolean
  }
  test_results?: {
    scores?: { [key: string]: number }
    personality?: string
    strengths?: string[]
  }
  additional_info?: string
}

interface JobRecommendation {
  id: string
  title: string
  description: string
  company: string
  location: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  experience_level: string
  skills: string
  remote: boolean
  posted_at: string
  relevance_score: number
  match_reasoning: string
}

// GET method for authenticated users - existing functionality
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

// POST method for Gemini AI-powered recommendations
export async function POST(req: NextRequest) {
  try {
    const userProfile: UserProfile = await req.json()

    if (!GEMINI_API_KEY) {
      const structuredError = logError('recommendations-gemini-config', new Error('Gemini API key not configured'))
      return NextResponse.json({
        error: 'Service configuration error',
        errorId: structuredError.id
      }, { status: 500 })
    }

    // Validate required profile data
    if (!userProfile.skills || !userProfile.experience) {
      return NextResponse.json({
        error: 'User profile must include skills and experience'
      }, { status: 400 })
    }

    // Get available jobs from database
    const supabase = await createRouteHandlerClient()
    
    let jobsQuery = supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(50) // Limit to most recent 50 jobs for analysis

    // Apply user preferences as filters if available
    if (userProfile.preferences?.location && userProfile.preferences.location !== 'remote') {
      jobsQuery = jobsQuery.eq('location', userProfile.preferences.location)
    }

    if (userProfile.preferences?.remote_work) {
      jobsQuery = jobsQuery.eq('remote', true)
    }

    if (userProfile.preferences?.employment_type && userProfile.preferences.employment_type.length > 0) {
      jobsQuery = jobsQuery.in('employment_type', userProfile.preferences.employment_type)
    }

    if (userProfile.preferences?.salary_range?.min) {
      jobsQuery = jobsQuery.gte('salary_max', userProfile.preferences.salary_range.min)
    }

    if (userProfile.preferences?.salary_range?.max) {
      jobsQuery = jobsQuery.lte('salary_min', userProfile.preferences.salary_range.max)
    }

    const { data: jobs, error: jobsError } = await jobsQuery

    if (jobsError) {
      const structuredError = logError('recommendations-database', jobsError)
      return NextResponse.json({
        error: 'Failed to fetch jobs',
        errorId: structuredError.id
      }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'No jobs found matching your criteria'
      }, { status: 200 })
    }

    // Analyze each job with Gemini AI
    const jobRecommendations: JobRecommendation[] = []

    for (const job of jobs) {
      try {
        const prompt = `
You are an expert job matching AI. Analyze how well this user profile matches the job requirements and provide a relevance score and reasoning.

USER PROFILE:
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.experience}
- Preferences: ${JSON.stringify(userProfile.preferences)}
- Test Results: ${JSON.stringify(userProfile.test_results || {})}
- Additional Info: ${userProfile.additional_info || 'N/A'}

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Required Skills: ${job.skills}
- Experience Level: ${job.experience_level}
- Location: ${job.location}
- Employment Type: ${job.employment_type}
- Remote: ${job.remote ? 'Yes' : 'No'}
- Salary Range: ${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'}

Provide your response in the following JSON format:
{
  "relevance_score": [number from 0-100],
  "match_reasoning": "[2-3 sentences explaining why this job is or isn't a good match for the user, focusing on skills alignment, experience fit, and preference match]"
}

Focus on:
1. Skills alignment (technical and soft skills)
2. Experience level match
3. User preferences alignment (location, remote work, employment type, salary)
4. Growth potential based on test results and career goals
5. Company culture fit if mentioned in job description

Be concise but specific in your reasoning.
`

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        })

        if (!response.ok) {
          console.error(`Gemini API error for job ${job.id}:`, response.status, response.statusText)
          // Continue with other jobs if one fails
          continue
        }

        const data = await response.json()
        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!analysisText) {
          console.error(`No analysis returned for job ${job.id}`)
          continue
        }

        // Parse the JSON response from Gemini
        let analysisData
        try {
          // Extract JSON from the response (it might be wrapped in markdown)
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        } catch (parseError) {
          console.error(`Failed to parse Gemini response for job ${job.id}:`, parseError)
          // Fallback: create a basic analysis
          analysisData = {
            relevance_score: 50,
            match_reasoning: 'Unable to analyze job match due to processing error'
          }
        }

        // Ensure score is within valid range
        const relevanceScore = Math.max(0, Math.min(100, analysisData.relevance_score || 0))

        jobRecommendations.push({
          ...job,
          relevance_score: relevanceScore,
          match_reasoning: analysisData.match_reasoning || 'No specific reasoning provided'
        })

      } catch (error) {
        console.error(`Error analyzing job ${job.id}:`, error)
        // Continue with other jobs
      }
    }

    // Sort by relevance score (highest first)
    jobRecommendations.sort((a, b) => b.relevance_score - a.relevance_score)

    // Filter out very low relevance scores (below 30) unless there are very few results
    let filteredRecommendations = jobRecommendations
    if (jobRecommendations.length > 10) {
      filteredRecommendations = jobRecommendations.filter(job => job.relevance_score >= 30)
    }

    // Return top 20 recommendations maximum
    const finalRecommendations = filteredRecommendations.slice(0, 20)

    return NextResponse.json({
      recommendations: finalRecommendations,
      total_analyzed: jobs.length,
      total_recommended: finalRecommendations.length
    }, { status: 200 })

  } catch (error) {
    const structuredError = logError('recommendations-error', error)
    
    const isNetworkError = error instanceof Error && 
      (error.message.includes('fetch') || error.message.includes('network'))
    
    const statusCode = isNetworkError ? 503 : 500
    const message = isNetworkError ? 
      'Network error communicating with AI service' : 
      'Failed to generate job recommendations'
    
    return NextResponse.json({
      error: message,
      errorId: structuredError.id
    }, { status: statusCode })
  }
}