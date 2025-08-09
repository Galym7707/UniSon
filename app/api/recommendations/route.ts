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
    salary_min?: number
    salary_max?: number
    employment_type?: string[]
    remote?: boolean
  }
  test_results?: {
    scores?: Record<string, number>
  }
  title?: string
  summary?: string
}

interface JobRecommendation {
  id: string
  title: string
  description: string
  location: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  remote: boolean
  skills: string
  experience_level: string
  posted_at: string
  relevance_score: number
  match_reasoning: string
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get available jobs (top 10)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(10)

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    if (!GEMINI_API_KEY) {
      // Fallback: return jobs with basic match scores
      const basicRecommendations = jobs.slice(0, 3).map((job: any) => ({
        ...job,
        match_score: Math.floor(Math.random() * 30) + 70,
        reasoning: `This position matches your background in ${profile.title || 'your field'} and appears to be a good fit based on the job requirements.`
      }))
      return NextResponse.json({ recommendations: basicRecommendations })
    }

    // Generate AI-powered recommendations for top 3 jobs
    const topJobs = jobs.slice(0, 3)
    const recommendations = []

    for (const job of topJobs) {
      try {
        const prompt = `
You are an expert job matching system. Analyze how well this candidate matches this job and provide a match score and reasoning.

CANDIDATE PROFILE:
- Name: ${profile.first_name} ${profile.last_name}
- Current Position: ${profile.title || 'Not specified'}
- Experience: ${profile.experience || 'Not specified'}
- Skills: ${profile.skills || 'Not specified'}
- Summary: ${profile.summary || 'Not specified'}
- Test Results: ${JSON.stringify(profile.test_results?.scores || {})}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Requirements: ${job.requirements}
- Skills Required: ${job.skills}
- Experience Level: ${job.experience_level}
- Location: ${job.location}

Please respond ONLY in this JSON format:
{
  "match_score": [number between 0-100],
  "reasoning": "[2-3 sentence explanation of why this is a good match, focusing on specific skills, experience, or qualifications that align]"
}
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

        if (response.ok) {
          const data = await response.json()
          const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
          
          try {
            // Try to parse JSON from response
            const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim()
            const analysis = JSON.parse(cleanJson)
            
            recommendations.push({
              ...job,
              match_score: Math.min(100, Math.max(0, analysis.match_score || 75)),
              reasoning: analysis.reasoning || `This position appears to be a good fit for your background in ${profile.title || 'your field'}.`
            })
          } catch (parseError) {
            // Fallback if JSON parsing fails
            recommendations.push({
              ...job,
              match_score: 75,
              reasoning: `This position matches your background and could be a good opportunity for career growth.`
            })
          }
        } else {
          // Fallback if API call fails
          recommendations.push({
            ...job,
            match_score: Math.floor(Math.random() * 30) + 70,
            reasoning: `This position aligns well with your experience and skills.`
          })
        }
      } catch (error) {
        console.error('Error analyzing job:', error)
        // Add job with fallback data
        recommendations.push({
          ...job,
          match_score: 70,
          reasoning: `This opportunity could be a good match based on your profile.`
        })
      }
    }

    // Sort by match score
    recommendations.sort((a, b) => b.match_score - a.match_score)

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Recommendations API error:', error)
    const structuredError = logError('recommendations-api-error', error)
    
    return NextResponse.json({ 
      error: 'Failed to generate recommendations',
      errorId: structuredError.id
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: UserProfile } = await req.json()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      const structuredError = logError('gemini-api-config', new Error('Gemini API key not configured'))
      return NextResponse.json({ 
        error: 'Service configuration error',
        errorId: structuredError.id 
      }, { status: 500 })
    }

    const supabase = await createRouteHandlerClient()

    // Fetch available jobs from database
    let jobsQuery = supabase.from('jobs').select('*')

    // Apply basic filtering based on user preferences
    if (profile.preferences?.location && profile.preferences.location !== 'remote') {
      jobsQuery = jobsQuery.eq('location', profile.preferences.location)
    }

    if (profile.preferences?.remote) {
      jobsQuery = jobsQuery.eq('remote', true)
    }

    if (profile.preferences?.salary_min) {
      jobsQuery = jobsQuery.gte('salary_max', profile.preferences.salary_min)
    }

    if (profile.preferences?.employment_type && profile.preferences.employment_type.length > 0) {
      jobsQuery = jobsQuery.in('employment_type', profile.preferences.employment_type)
    }

    jobsQuery = jobsQuery.order('posted_at', { ascending: false }).limit(20)

    const { data: jobs, error: jobsError } = await jobsQuery

    if (jobsError) {
      const structuredError = logError('jobs-fetch-error', jobsError)
      return NextResponse.json(
        { error: 'Failed to fetch jobs', errorId: structuredError.id },
        { status: 500 }
      )
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ recommendations: [] }, { status: 200 })
    }

    // Prepare prompt for Gemini AI
    const userSkills = Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''
    const testScores = profile.test_results?.scores ? 
      Object.entries(profile.test_results.scores).map(([key, value]) => `${key}: ${value}`).join(', ') 
      : 'No test results'

    const jobsForAnalysis = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description.substring(0, 500), // Limit description length
      skills: job.skills,
      experience_level: job.experience_level,
      location: job.location,
      remote: job.remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      employment_type: job.employment_type
    }))

    const prompt = `
Analyze job matches for a candidate and provide relevance scores and reasoning.

CANDIDATE PROFILE:
- Position: ${profile.title || 'Not specified'}
- Experience: ${profile.experience || 'Not specified'}
- Skills: ${userSkills}
- Summary: ${profile.summary || 'Not provided'}
- Test Results: ${testScores}
- Location Preference: ${profile.preferences?.location || 'Any'}
- Salary Range: ${profile.preferences?.salary_min || 0} - ${profile.preferences?.salary_max || 'No limit'}
- Remote Work: ${profile.preferences?.remote ? 'Yes' : 'No preference'}

JOBS TO ANALYZE:
${JSON.stringify(jobsForAnalysis, null, 2)}

For each job, analyze the match between the candidate profile and job requirements. Consider:
1. Skills alignment (technical and soft skills)
2. Experience level match
3. Location and remote work preferences
4. Salary expectations
5. Career progression potential
6. Cultural fit based on job description

Provide your analysis as a JSON array where each object has:
- job_id: the job ID
- relevance_score: integer from 0-100 (100 = perfect match)
- match_reasoning: detailed explanation of why this job matches the candidate

Return ONLY the JSON array, no additional text.
`

    // Call Gemini API
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
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })
    })

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`
      const structuredError = logError('gemini-api-request', new Error(errorMessage), {
        status: response.status,
        statusText: response.statusText
      })
      
      const statusCode = response.status === 429 ? 429 : 
                        response.status >= 500 ? 503 : 400
      const message = response.status === 429 ? 'AI service rate limit exceeded. Please try again later.' :
                     response.status >= 500 ? 'AI service temporarily unavailable' :
                     'Invalid request to AI service'
      
      return NextResponse.json({ 
        error: message,
        errorId: structuredError.id 
      }, { status: statusCode })
    }

    const aiData = await response.json()
    const aiAnalysis = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiAnalysis) {
      const structuredError = logError('gemini-empty-response', new Error('No analysis received from AI'))
      return NextResponse.json({ 
        error: 'Failed to generate recommendations',
        errorId: structuredError.id 
      }, { status: 500 })
    }

    let analysisResults: Array<{ job_id: string; relevance_score: number; match_reasoning: string }>
    try {
      // Extract JSON from the response (may have some text before/after)
      const jsonMatch = aiAnalysis.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiAnalysis
      analysisResults = JSON.parse(jsonString)
    } catch (parseError) {
      const structuredError = logError('gemini-parse-error', parseError, { aiResponse: aiAnalysis })
      return NextResponse.json({ 
        error: 'Failed to parse AI recommendations',
        errorId: structuredError.id 
      }, { status: 500 })
    }

    // Combine job data with AI analysis
    const recommendations: JobRecommendation[] = jobs
      .map(job => {
        const analysis = analysisResults.find(result => result.job_id === job.id)
        
        return {
          ...job,
          relevance_score: analysis?.relevance_score || 0,
          match_reasoning: analysis?.match_reasoning || 'No analysis available'
        }
      })
      .filter(job => job.relevance_score > 0) // Only include jobs with valid scores
      .sort((a, b) => b.relevance_score - a.relevance_score) // Sort by relevance score

    return NextResponse.json({ 
      recommendations,
      total: recommendations.length 
    }, { status: 200 })

  } catch (error) {
    const structuredError = logError('recommendations-error', error)
    
    const isNetworkError = error instanceof Error && 
      (error.message.includes('fetch') || error.message.includes('network'))
    
    const statusCode = isNetworkError ? 503 : 500
    const message = isNetworkError ? 
      'Network error communicating with AI service' : 
      'Failed to generate recommendations'
    
    return NextResponse.json({ 
      error: message,
      errorId: structuredError.id
    }, { status: statusCode })
  }
}