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

    // Get current session with comprehensive error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      if (sessionError.message.includes('Invalid JWT')) {
        throw new Error('Your session has expired. Please sign in again.')
      }
      if (sessionError.message.includes('Network error')) {
        throw new Error('Network error. Please check your connection and try again.')
      }
      throw new Error(`Authentication error: ${sessionError.message}`)
    }
    
    if (!session?.user) {
      throw new Error('No authenticated user found. Please sign in.')
    }

    const userId = session.user.id
    const userMetadata = session.user.user_metadata || {}

    // First, try to fetch existing profile with retry logic
    let existingProfile = null
    let profileError = null
    let retryCount = 0
    const MAX_RETRIES = 3

    while (retryCount < MAX_RETRIES) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data && !error) {
        existingProfile = data
        profileError = null
        break
      }

      if (error && error.code === 'PGRST116') {
        // No rows returned - profile doesn't exist, this is expected
        profileError = error
        break
      }

      if (error && (error.message.includes('timeout') || error.message.includes('network'))) {
        retryCount++
        if (retryCount < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          continue
        }
      }

      profileError = error
      break
    }

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
      if (profileError.code === '42P01') {
        throw new Error('Database configuration error. Please contact support.')
      }
      if (profileError.code === '42501') {
        throw new Error('Database access denied. Please contact support.')
      }
      if (profileError.message.includes('timeout')) {
        throw new Error('Database timeout. Please try again in a moment.')
      }
      throw new Error(`Profile fetch error: ${profileError.message}`)
    }

    // Profile doesn't exist, create it using auth metadata
    // Extract name parts from full name if individual parts aren't available
    const fullName = userMetadata.name || userMetadata.full_name || ''
    const nameParts = fullName.split(' ').filter((part: string) => part.trim())
    const firstName = userMetadata.first_name || nameParts[0] || ''
    const lastName = userMetadata.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '')

    // Validate email
    if (!session.user.email) {
      throw new Error('User email is required for profile creation.')
    }

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

    // Create profile with retry logic
    let createdProfile = null
    let createError = null
    retryCount = 0

    while (retryCount < MAX_RETRIES) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (data && !error) {
        createdProfile = data
        createError = null
        break
      }

      if (error && (error.message.includes('timeout') || error.message.includes('network'))) {
        retryCount++
        if (retryCount < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          continue
        }
      }

      createError = error
      break
    }

    if (createError) {
      if (createError.code === '23505') {
        // Profile already exists (race condition), try to fetch it
        const { data: raceProfile, error: raceError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (raceProfile && !raceError) {
          return {
            profile: raceProfile,
            error: null,
            wasCreated: false
          }
        }
        throw new Error('Profile creation conflict. Please refresh the page and try again.')
      }
      if (createError.code === '23502') {
        throw new Error('Missing required profile information. Please contact support.')
      }
      if (createError.code === '42501') {
        throw new Error('Permission denied. Please contact support.')
      }
      if (createError.code === '42P01') {
        throw new Error('Database configuration error. Please contact support.')
      }
      throw new Error(`Profile creation failed: ${createError.message}`)
    }

    if (!createdProfile) {
      throw new Error('Profile creation failed: No profile data returned.')
    }

    return {
      profile: createdProfile,
      error: null,
      wasCreated: true
    }

  } catch (err) {
    const errorMessage = getUserFriendlyErrorMessage(err)
    logError('profile-fallback', err, {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    })
    
    return {
      profile: null,
      error: errorMessage,
      wasCreated: false
    }
  }
}