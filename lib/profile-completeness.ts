// lib/profile-completeness.ts

/**
 * Interface for individual experience items
 */
export interface ExperienceItem {
  company: string
  title: string
  startDate: string
  endDate?: string
  description?: string
  current?: boolean
}

/**
 * Interface for individual skill items
 */
export interface SkillItem {
  name: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

/**
 * Interface for programming skills
 */
export interface ProgrammingSkillItem {
  language: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

/**
 * Interface for language skills
 */
export interface LanguageSkillItem {
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
}

/**
 * Complete user profile interface for profile completeness calculation
 */
export interface UserProfile {
  id: string
  email?: string
  role?: string
  first_name?: string
  last_name?: string
  name?: string
  professional_title?: string
  professional_summary?: string
  experience?: ExperienceItem[]
  skills?: SkillItem[]
  programming_skills?: ProgrammingSkillItem[]
  language_skills?: LanguageSkillItem[]
  created_at?: string
  updated_at?: string
}

/**
 * Checks if a string is meaningful (not empty, null, undefined, or just whitespace)
 */
function isMeaningfulString(value: string | null | undefined): boolean {
  return value != null && value.trim().length > 0
}

/**
 * Checks if an array contains meaningful data
 */
function isMeaningfulArray<T>(value: T[] | null | undefined): boolean {
  return Array.isArray(value) && value.length > 0
}

/**
 * Calculates profile completeness as a percentage (0-100)
 * Weights critical fields more heavily than optional ones
 */
export function calculateProfileCompleteness(profile: UserProfile | null | undefined): number {
  if (!profile) {
    return 0
  }

  let totalWeight = 0
  let completedWeight = 0

  // Critical fields (higher weight)
  const CRITICAL_WEIGHT = 25
  
  // Name components (first_name AND last_name required)
  totalWeight += CRITICAL_WEIGHT
  if (isMeaningfulString(profile.first_name) && isMeaningfulString(profile.last_name)) {
    completedWeight += CRITICAL_WEIGHT
  }

  // Professional title
  totalWeight += CRITICAL_WEIGHT
  if (isMeaningfulString(profile.professional_title)) {
    completedWeight += CRITICAL_WEIGHT
  }

  // Important fields (medium weight)
  const IMPORTANT_WEIGHT = 15

  // Professional summary
  totalWeight += IMPORTANT_WEIGHT
  if (isMeaningfulString(profile.professional_summary)) {
    completedWeight += IMPORTANT_WEIGHT
  }

  // Optional fields (lower weight)
  const OPTIONAL_WEIGHT = 8.75 // This makes each optional field worth 8.75% so all 4 together = 35%

  // Experience array
  totalWeight += OPTIONAL_WEIGHT
  if (isMeaningfulArray(profile.experience)) {
    // Check if experience items have meaningful content
    const hasValidExperience = profile.experience!.some(exp => 
      isMeaningfulString(exp.company) && 
      isMeaningfulString(exp.title) && 
      isMeaningfulString(exp.startDate)
    )
    if (hasValidExperience) {
      completedWeight += OPTIONAL_WEIGHT
    }
  }

  // Skills array
  totalWeight += OPTIONAL_WEIGHT
  if (isMeaningfulArray(profile.skills)) {
    const hasValidSkills = profile.skills!.some(skill => 
      isMeaningfulString(skill.name)
    )
    if (hasValidSkills) {
      completedWeight += OPTIONAL_WEIGHT
    }
  }

  // Programming skills array
  totalWeight += OPTIONAL_WEIGHT
  if (isMeaningfulArray(profile.programming_skills)) {
    const hasValidProgrammingSkills = profile.programming_skills!.some(skill => 
      isMeaningfulString(skill.language)
    )
    if (hasValidProgrammingSkills) {
      completedWeight += OPTIONAL_WEIGHT
    }
  }

  // Language skills array
  totalWeight += OPTIONAL_WEIGHT
  if (isMeaningfulArray(profile.language_skills)) {
    const hasValidLanguageSkills = profile.language_skills!.some(skill => 
      isMeaningfulString(skill.language) && 
      skill.proficiency != null
    )
    if (hasValidLanguageSkills) {
      completedWeight += OPTIONAL_WEIGHT
    }
  }

  // Calculate percentage
  const percentage = Math.round((completedWeight / totalWeight) * 100)
  
  // Ensure result is within 0-100 range
  return Math.max(0, Math.min(100, percentage))
}

/**
 * Gets a user-friendly description of profile completeness
 */
export function getProfileCompletenessDescription(percentage: number): string {
  if (percentage === 100) {
    return 'Complete'
  } else if (percentage >= 80) {
    return 'Nearly Complete'
  } else if (percentage >= 60) {
    return 'Good Progress'
  } else if (percentage >= 40) {
    return 'Basic Info Added'
  } else if (percentage > 0) {
    return 'Getting Started'
  } else {
    return 'Not Started'
  }
}

/**
 * Gets suggestions for improving profile completeness
 */
export function getProfileCompletionSuggestions(profile: UserProfile | null | undefined): string[] {
  if (!profile) {
    return ['Complete your profile setup to get started']
  }

  const suggestions: string[] = []

  // Check critical fields
  if (!isMeaningfulString(profile.first_name) || !isMeaningfulString(profile.last_name)) {
    suggestions.push('Add your full name')
  }

  if (!isMeaningfulString(profile.professional_title)) {
    suggestions.push('Add your professional title')
  }

  // Check important fields
  if (!isMeaningfulString(profile.professional_summary)) {
    suggestions.push('Write a professional summary')
  }

  // Check optional fields
  if (!isMeaningfulArray(profile.experience)) {
    suggestions.push('Add your work experience')
  }

  if (!isMeaningfulArray(profile.skills)) {
    suggestions.push('List your skills')
  }

  if (!isMeaningfulArray(profile.programming_skills)) {
    suggestions.push('Add your programming skills')
  }

  if (!isMeaningfulArray(profile.language_skills)) {
    suggestions.push('Add your language skills')
  }

  return suggestions
}