import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string; candidateId: string }> }
) {
  const params = await context.params
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user can access this candidate data
    if (user.id !== params.candidateId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get candidate profile
    const { data: candidateProfile, error: profileError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('candidate_id', params.candidateId)
      .single()

    if (profileError || !candidateProfile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    // Calculate match score
    const matchScore = await calculateMatchScore(job, candidateProfile)

    return NextResponse.json({
      jobId: params.jobId,
      candidateId: params.candidateId,
      matchScore: matchScore.overall,
      breakdown: {
        skillsMatch: matchScore.skillsMatch,
        experienceMatch: matchScore.experienceMatch
      }
    })

  } catch (error) {
    console.error('Error calculating match score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateMatchScore(job: any, candidateProfile: any) {
  const breakdown = {
    skillsMatch: 0,
    experienceMatch: 0,
    overall: 0
  }

  // Calculate skills match
  const jobSkills = Array.isArray(job.required_skills) ? job.required_skills : []
  const candidateSkills = candidateProfile.extracted_skills || []
  
  if (jobSkills.length > 0 && candidateSkills.length > 0) {
    const candidateSkillNames = candidateSkills.map((skill: any) => 
      typeof skill === 'object' ? skill.skill.toLowerCase() : skill.toLowerCase()
    )
    
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
    
    breakdown.skillsMatch = totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0
  } else {
    breakdown.skillsMatch = candidateSkills.length > 0 ? 50 : 0 // Give partial credit if candidate has any skills
  }

  // Calculate experience match
  const jobExpLevel = job.experience_level
  const candidateExpLevel = candidateProfile.experience_level

  if (jobExpLevel && candidateExpLevel) {
    const expLevels = ['entry', 'mid', 'senior', 'lead', 'executive']
    const jobExpIndex = expLevels.indexOf(jobExpLevel)
    const candidateExpIndex = expLevels.indexOf(candidateExpLevel)
    
    if (jobExpIndex >= 0 && candidateExpIndex >= 0) {
      // Perfect match: 100%, One level off: 80%, Two levels: 60%, etc.
      const levelDiff = Math.abs(jobExpIndex - candidateExpIndex)
      if (levelDiff === 0) {
        breakdown.experienceMatch = 100
      } else if (levelDiff === 1) {
        breakdown.experienceMatch = 80
      } else if (levelDiff === 2) {
        breakdown.experienceMatch = 60
      } else {
        breakdown.experienceMatch = 40
      }
    } else {
      breakdown.experienceMatch = 50 // Default if can't parse levels
    }
  } else {
    breakdown.experienceMatch = 50 // Default if no experience level info
  }

  // Calculate overall score (weighted average)
  // Skills are more important (70%) than experience level (30%)
  breakdown.overall = Math.round(
    (breakdown.skillsMatch * 0.7) + (breakdown.experienceMatch * 0.3)
  )

  // Round individual scores
  breakdown.skillsMatch = Math.round(breakdown.skillsMatch)
  breakdown.experienceMatch = Math.round(breakdown.experienceMatch)

  return breakdown
}