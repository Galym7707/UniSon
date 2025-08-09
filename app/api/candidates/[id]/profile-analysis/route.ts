import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user can access this candidate profile
    if (user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { resumeText } = body

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    // Analyze resume text to extract skills and experience
    const extractedSkills = await extractSkillsFromResume(resumeText)
    const experienceLevel = await extractExperienceLevel(resumeText)
    
    // Create or update candidate profile
    const { data: existingProfile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('candidate_id', params.id)
      .single()

    let profileData
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('candidate_profiles')
        .update({
          extracted_skills: extractedSkills,
          experience_level: experienceLevel,
          resume_text: resumeText,
          analysis_metadata: {
            analyzed_at: new Date().toISOString(),
            total_skills: extractedSkills.length
          },
          updated_at: new Date().toISOString()
        })
        .eq('candidate_id', params.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating candidate profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
      profileData = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('candidate_profiles')
        .insert({
          candidate_id: params.id,
          extracted_skills: extractedSkills,
          experience_level: experienceLevel,
          resume_text: resumeText,
          analysis_metadata: {
            analyzed_at: new Date().toISOString(),
            total_skills: extractedSkills.length
          }
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating candidate profile:', error)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      profileData = data
    }

    return NextResponse.json({
      success: true,
      profile: profileData
    })

  } catch (error) {
    console.error('Error in profile analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function extractSkillsFromResume(resumeText: string) {
  // Common technical skills to look for
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap', 'jQuery',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
  ]

  const extractedSkills: Array<{ skill: string; confidence: number; category?: string }> = []
  const resumeLower = resumeText.toLowerCase()

  skillKeywords.forEach(skill => {
    const skillLower = skill.toLowerCase()
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const matches = resumeText.match(regex)
    
    if (matches) {
      const confidence = Math.min(matches.length * 0.3 + 0.7, 1) // Base confidence + frequency boost
      extractedSkills.push({
        skill: skill,
        confidence: Math.round(confidence * 100) / 100,
        category: categorizeSkill(skill)
      })
    }
  })

  // Sort by confidence and return top skills
  return extractedSkills
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20) // Limit to top 20 skills
}

async function extractExperienceLevel(resumeText: string): Promise<string> {
  const resumeLower = resumeText.toLowerCase()
  
  // Look for explicit experience mentions
  const seniorPatterns = [
    /senior/gi, /lead/gi, /principal/gi, /architect/gi, /director/gi,
    /\b(\d+)\+?\s*years?\s*(of\s*)?experience/gi
  ]
  
  const midPatterns = [
    /\b[3-7]\s*years?\s*(of\s*)?experience/gi,
    /intermediate/gi, /mid[\s-]level/gi
  ]
  
  const entryPatterns = [
    /junior/gi, /entry[\s-]level/gi, /intern/gi, /graduate/gi,
    /\b[0-2]\s*years?\s*(of\s*)?experience/gi, /new\s*grad/gi
  ]

  // Check for years of experience
  const yearMatches = resumeText.match(/\b(\d+)\+?\s*years?\s*(of\s*)?experience/gi)
  if (yearMatches) {
    const years = parseInt(yearMatches[0].match(/\d+/)?.[0] || '0')
    if (years >= 8) return 'senior'
    if (years >= 3) return 'mid'
    if (years <= 2) return 'entry'
  }

  // Check for explicit level mentions
  const seniorMatches = seniorPatterns.some(pattern => pattern.test(resumeText))
  const midMatches = midPatterns.some(pattern => pattern.test(resumeText))
  const entryMatches = entryPatterns.some(pattern => pattern.test(resumeText))

  if (seniorMatches) return 'senior'
  if (midMatches) return 'mid'
  if (entryMatches) return 'entry'

  // Default to mid if unclear
  return 'mid'
}

function categorizeSkill(skill: string): string {
  const categories: Record<string, string[]> = {
    'frontend': ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'jQuery', 'Bootstrap', 'Tailwind'],
    'backend': ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', 'PHP', 'Ruby'],
    'database': ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    'cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
    'tools': ['Git', 'GitHub', 'GitLab', 'Jenkins', 'Jira', 'CI/CD'],
    'data': ['Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'],
    'api': ['REST API', 'GraphQL', 'Microservices']
  }

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.includes(skill)) {
      return category
    }
  }

  return 'general'
}