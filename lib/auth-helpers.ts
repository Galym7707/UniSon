import { createBrowserClient } from './supabase/browser'
import { createServerSupabase } from './supabase/server'
import { logError, getUserFriendlyErrorMessage } from './error-handling'

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
}

// Server-side auth helpers
export const serverAuth = {
  async getCurrentUser() {
    try {
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