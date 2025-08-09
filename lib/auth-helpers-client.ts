import { createBrowserClient } from './supabase/browser'
import { logError, getUserFriendlyErrorMessage } from './error-handling'

// User role types
export type UserRole = 'job-seeker' | 'employer' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  created_at: string
  updated_at: string
}

// Client-side auth helpers
export const clientAuth = {
  async signIn(email: string, password: string) {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      logError('client-sign-in', error)
      return { 
        user: null, 
        session: null, 
        error: getUserFriendlyErrorMessage(error) 
      }
    }
  },

  async signUp(email: string, password: string, metadata?: any) {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      
      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      logError('client-sign-up', error)
      return { 
        user: null, 
        session: null, 
        error: getUserFriendlyErrorMessage(error) 
      }
    }
  },

  async signOut() {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      logError('client-sign-out', error)
      return { error: getUserFriendlyErrorMessage(error) }
    }
  },

  async getCurrentUser() {
    try {
      const supabase = createBrowserClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      logError('client-get-user', error)
      return { user: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async getCurrentSession() {
    try {
      const supabase = createBrowserClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      logError('client-get-session', error)
      return { session: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async getUserProfile(): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      const supabase = createBrowserClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error('No authenticated user')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      return { profile, error: null }
    } catch (error) {
      logError('client-get-profile', error)
      return { profile: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async requireEmployerAccess(): Promise<{ profile: UserProfile; error: string | null }> {
    try {
      const { profile, error } = await this.getUserProfile()
      
      if (error || !profile) {
        throw new Error(error || 'Unable to load user profile')
      }

      if (profile.role !== 'employer' && profile.role !== 'admin') {
        throw new Error('You must have employer privileges to access this feature')
      }

      return { profile, error: null }
    } catch (error) {
      logError('client-require-employer', error)
      return { 
        profile: null as any, 
        error: getUserFriendlyErrorMessage(error) 
      }
    }
  },
}