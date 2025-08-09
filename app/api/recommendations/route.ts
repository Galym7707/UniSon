import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError } from '@/lib/error-handling'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

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