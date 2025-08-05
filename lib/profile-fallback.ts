// lib/profile-fallback.ts
import { createBrowserClient } from '@/lib/supabase/browser'
import { logError, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export interface ProfileData {
  id: string
  email?: string
  role?: string
  name?: string
  first_name?: string
  last_name?: string
  title?: string
  summary?: string
  experience?: string
  skills?: string
  resume_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProfileFallbackResult {
  profile: ProfileData | null
  error: string | null
  wasCreated: boolean
}

/**
 * Checks if a user's profile exists and creates one if it doesn't
 * Uses auth metadata (role, name) to populate the new profile
 */
export async function ensureUserProfile(): Promise<ProfileFallbackResult> {
  try {
    const supabase = createBrowserClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Authentication error: ${sessionError.message}`)
    }
    
    if (!session?.user) {
      throw new Error('No authenticated user found')
    }

    const userId = session.user.id
    const userMetadata = session.user.user_metadata || {}

    // First, try to fetch existing profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // If profile exists, return it
    if (existingProfile && !profileError) {
      return {
        profile: existingProfile,
        error: null,
        wasCreated: false
      }
    }

    // If error is not "no rows returned", it's a real error
    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Profile fetch error: ${profileError.message}`)
    }

    // Profile doesn't exist, create it using auth metadata
    // Extract name parts from full name if individual parts aren't available
    const fullName = userMetadata.name || userMetadata.full_name || ''
    const nameParts = fullName.split(' ')
    const firstName = userMetadata.first_name || nameParts[0] || ''
    const lastName = userMetadata.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '')

    const newProfile: Partial<ProfileData> = {
      id: userId,
      email: session.user.email,
      role: userMetadata.role || 'job_seeker',
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      title: '',
      summary: '',
      experience: '',
      skills: '',
      resume_url: null
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (createError) {
      throw new Error(`Profile creation error: ${createError.message}`)
    }

    return {
      profile: createdProfile,
      error: null,
      wasCreated: true
    }

  } catch (err) {
    const errorMessage = getUserFriendlyErrorMessage(err)
    logError('profile-fallback', err)
    
    return {
      profile: null,
      error: errorMessage,
      wasCreated: false
    }
  }
}