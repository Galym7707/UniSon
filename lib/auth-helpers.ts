import { createBrowserClient } from './supabase/browser'
import { logError, getUserFriendlyErrorMessage } from './error-handling'
import { redirect } from 'next/navigation'

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

// Authentication errors
export class AuthenticationError extends Error {
  constructor(message: string, public redirectTo?: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public redirectTo?: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// Role-based access control
export const rolePermissions = {
  'job-seeker': ['view_own_profile', 'apply_to_jobs', 'view_jobs'],
  'employer': ['view_own_profile', 'manage_company_profile', 'manage_jobs', 'view_candidates'],
  'admin': ['*'] // Admin has all permissions
} as const

export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === 'admin') return true
  return rolePermissions[userRole]?.includes(permission as any) || false
}

export function requireEmployerRole(userRole: UserRole): void {
  if (userRole !== 'employer' && userRole !== 'admin') {
    throw new AuthorizationError(
      'You must have employer privileges to access this feature. Please contact support if you believe this is an error.',
      '/unauthorized?reason=insufficient_permissions'
    )
  }
}

// Server-side authentication middleware
export async function requireAuth(options?: { role?: UserRole }): Promise<{ user: any; profile: UserProfile }> {
  try {
    // Lazy import to avoid loading server dependencies in client code
    const { createServerSupabase } = await import('./supabase/server')
    const supabase = await createServerSupabase()
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      logError('auth-middleware-session', sessionError)
      throw new AuthenticationError('Authentication failed. Please try logging in again.', '/auth/login')
    }

    if (!session || !session.user) {
      throw new AuthenticationError('Please log in to access this page.', '/auth/login?message=login_required')
    }

    // Verify email confirmation
    if (!session.user.email_confirmed_at) {
      throw new AuthenticationError('Please verify your email address to continue.', '/auth/verify-email')
    }

    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      logError('auth-middleware-profile', profileError)
      throw new AuthenticationError('Unable to load your profile. Please try again.', '/auth/login')
    }

    // Check role requirements
    if (options?.role && profile.role !== options.role && profile.role !== 'admin') {
      const roleName = options.role === 'employer' ? 'employer' : 'user'
      throw new AuthorizationError(
        `This page requires ${roleName} privileges. Please contact support if you believe this is an error.`,
        '/unauthorized?reason=insufficient_permissions'
      )
    }

    return { user: session.user, profile }
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      if (error.redirectTo) {
        redirect(error.redirectTo)
      }
      throw error
    }
    
    logError('auth-middleware-unexpected', error)
    throw new AuthenticationError('Authentication failed. Please try logging in again.', '/auth/login')
  }
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

// Server-side auth helpers
export const serverAuth = {
  async getCurrentUser() {
    try {
      const { createServerSupabase } = await import('./supabase/server')
      const supabase = await createServerSupabase()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      logError('server-get-user', error)
      return { user: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async getCurrentSession() {
    try {
      const { createServerSupabase } = await import('./supabase/server')
      const supabase = await createServerSupabase()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      logError('server-get-session', error)
      return { session: null, error: getUserFriendlyErrorMessage(error) }
    }
  },
}

// Database helpers with error handling
export const createDatabaseHelpers = (supabase: any) => ({
  async query<T>(
    table: string,
    select: string = '*',
    filters?: Record<string, any>
  ): Promise<{ data: T[] | null; error: string | null }> {
    try {
      let query = supabase.from(table).select(select)
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      logError(`database-query-${table}`, error)
      return { data: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async insert<T>(
    table: string,
    data: any
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      logError(`database-insert-${table}`, error)
      return { data: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async update<T>(
    table: string,
    data: any,
    filters: Record<string, any>
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      let query = supabase.from(table).update(data)
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data: result, error } = await query.select().single()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      logError(`database-update-${table}`, error)
      return { data: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async upsert<T>(
    table: string,
    data: any
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert(data)
        .select()
        .single()
      
      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      logError(`database-upsert-${table}`, error)
      return { data: null, error: getUserFriendlyErrorMessage(error) }
    }
  },

  async delete(
    table: string,
    filters: Record<string, any>
  ): Promise<{ error: string | null }> {
    try {
      let query = supabase.from(table).delete()
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { error } = await query
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      logError(`database-delete-${table}`, error)
      return { error: getUserFriendlyErrorMessage(error) }
    }
  },
})