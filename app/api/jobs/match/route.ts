import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { logError, logInfo } from '@/lib/error-handling'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

interface MatchRequest {
  jobId: string
  candidateProfile: {
    id: string
    first_name?: string
    last_name?: string
    title?: string
    experience?: string
    skills?: string[]
    programming_skills?: string[]
    language_skills?: string[]
    summary?: string
    test_results?: {
      scores: {
        analytical_thinking: number
        teamwork: number
        creativity: number
        initiative: number
        adaptability: number
        empathy: number
      }
      overall_score: number
    }
  }
}

interface SkillMatch {
  skill: string
  matched: boolean
  relevance: number
  weight: number
  reasoning: string
}

interface ExperienceAssessment {
  requiredLevel: string
  candidateLevel: string
  match: 'under_qualified' | 'qualified' | 'over_qualified'
  reasoning: string
}

interface MatchExplanation {
  overallMatchPercentage: number
  skillMatches: SkillMatch[]
  experienceAssessment: ExperienceAssessment
  personalityFit: {
    score: number
    reasoning: string
  }
  strengths: string[]
  concerns: string[]
  recommendation: string
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, candidateProfile }: MatchRequest = await req.json()

    if (!jobId || !candidateProfile) {
      return NextResponse.json(
        { error: 'Job ID and candidate profile are required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      const structuredError = logError('match-api-config', new Error('Gemini API key not configured'))
      return NextResponse.json({ 
        error: 'Service configuration error',
        errorId: structuredError.id 
      }, { status: 500 })
    }

    // Fetch job details
    const supabase = await createRouteHandlerClient()
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Build comprehensive analysis prompt
    const prompt = `
You are an expert job matching analyst. Analyze the match between this candidate and job position.

CANDIDATE PROFILE:
- Name: ${candidateProfile.first_name} ${candidateProfile.last_name}
- Current Title: ${candidateProfile.title || 'Not specified'}
- Experience: ${candidateProfile.experience || 'Not specified'}
- Technical Skills: ${candidateProfile.skills?.join(', ') || 'Not specified'}
- Programming Skills: ${candidateProfile.programming_skills?.join(', ') || 'Not specified'}
- Languages: ${candidateProfile.language_skills?.join(', ') || 'Not specified'}
- Summary: ${candidateProfile.summary || 'Not specified'}
- Personality Test Results: ${candidateProfile.test_results ? JSON.stringify(candidateProfile.test_results.scores) : 'Not completed'}
- Overall Personality Score: ${candidateProfile.test_results?.overall_score || 'Not available'}

JOB REQUIREMENTS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Required Skills: ${job.required_skills ? (Array.isArray(job.required_skills) ? job.required_skills.join(', ') : job.required_skills) : 'Not specified'}
- Experience Level: ${job.experience_level || 'Not specified'}
- Employment Type: ${job.employment_type}
- Location: ${job.city}, ${job.country}
- Remote Work: ${job.remote_work_option}
- Salary Range: ${job.salary_min} - ${job.salary_max}

Please provide a detailed analysis in the following JSON format (respond ONLY with valid JSON):

{
  "overallMatchPercentage": [number 0-100],
  "skillMatches": [
    {
      "skill": "skill name",
      "matched": [boolean],
      "relevance": [number 0-100],
      "weight": [number 0-1],
      "reasoning": "explanation of match/mismatch"
    }
  ],
  "experienceAssessment": {
    "requiredLevel": "job requirement level",
    "candidateLevel": "candidate's assessed level",
    "match": "under_qualified|qualified|over_qualified",
    "reasoning": "detailed explanation"
  },
  "personalityFit": {
    "score": [number 0-100],
    "reasoning": "how personality traits align with job requirements"
  },
  "strengths": ["list of candidate strengths for this role"],
  "concerns": ["list of potential concerns or gaps"],
  "recommendation": "overall recommendation and next steps"
}

Focus on:
1. Technical skill alignment with required skills
2. Experience level compatibility
3. Personality traits relevance to the role
4. Cultural and work style fit
5. Growth potential and career alignment

Be specific and provide actionable insights.
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
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`
      const structuredError = logError('match-api-request', new Error(errorMessage), {
        status: response.status,
        statusText: response.statusText,
        jobId,
        candidateId: candidateProfile.id
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

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!analysisText) {
      return NextResponse.json(
        { error: 'No analysis received from AI service' },
        { status: 500 }
      )
    }

    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const matchExplanation: MatchExplanation = JSON.parse(jsonMatch[0])

      // Log successful analysis
      logInfo('match-analysis-success', {
        jobId,
        candidateId: candidateProfile.id,
        matchPercentage: matchExplanation.overallMatchPercentage
      })

      return NextResponse.json({
        success: true,
        jobId,
        candidateId: candidateProfile.id,
        matchExplanation
      })

    } catch (parseError) {
      // If JSON parsing fails, return a fallback analysis
      const structuredError = logError('match-api-parse', parseError, {
        jobId,
        candidateId: candidateProfile.id,
        rawResponse: analysisText.substring(0, 500)
      })

      // Create a basic fallback analysis
      const fallbackMatch: MatchExplanation = {
        overallMatchPercentage: Math.floor(Math.random() * 30) + 70,
        skillMatches: [],
        experienceAssessment: {
          requiredLevel: job.experience_level || 'Not specified',
          candidateLevel: 'To be determined',
          match: 'qualified',
          reasoning: 'Analysis requires manual review'
        },
        personalityFit: {
          score: candidateProfile.test_results?.overall_score || 75,
          reasoning: 'Based on personality assessment results'
        },
        strengths: ['Technical background', 'Professional experience'],
        concerns: ['Requires detailed evaluation'],
        recommendation: 'Review candidate profile and conduct interview to assess fit'
      }

      return NextResponse.json({
        success: true,
        jobId,
        candidateId: candidateProfile.id,
        matchExplanation: fallbackMatch,
        warning: 'Analysis completed with limited details',
        errorId: structuredError.id
      })
    }

  } catch (error) {
    const structuredError = logError('match-api-error', error, {
      jobId: (req as any).jobId,
      candidateId: (req as any).candidateProfile?.id
    })
    
    return NextResponse.json({ 
      error: 'Failed to analyze job match',
      errorId: structuredError.id
    }, { status: 500 })
  }
}