import { useState, useEffect } from 'react'
import { createBrowserClient } from './browser'
import { useAsyncOperation } from '../error-handling'

// Hook for getting current user with error handling
export const useUser = () => {
  const [user, setUser] = useState<any>(null)
  const { isLoading, error, execute } = useAsyncOperation()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createBrowserClient()
      return supabase.auth.getUser()
    }

    execute(loadUser, 'get-user', {
      showToast: false,
      onSuccess: ({ data }) => setUser(data.user),
    })
  }, [])

  return { user, isLoading, error }
}

// Hook for authentication state changes
export const useAuthState = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// Hook for database queries with error handling
export const useSupabaseQuery = <T>(
  queryFn: (supabase: any) => Promise<{ data: T; error: any }>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null)
  const { isLoading, error, execute } = useAsyncOperation()

  const refetch = () => {
    const supabase = createBrowserClient()
    execute(() => queryFn(supabase), 'supabase-query', {
      onSuccess: (result) => setData(result.data),
    })
  }

  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, isLoading, error, refetch }
}

// Hook for mutations with error handling
export const useSupabaseMutation = <T, P = any>(
  mutationFn: (supabase: any, params: P) => Promise<{ data: T; error: any }>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    showToast?: boolean
  }
) => {
  const { isLoading, error, execute } = useAsyncOperation()

  const mutate = async (params: P) => {
    const supabase = createBrowserClient()
    return execute(
      async () => {
        const result = await mutationFn(supabase, params)
        if (result.error) throw new Error(result.error.message)
        return result.data
      },
      'supabase-mutation',
      {
        showToast: options?.showToast,
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    )
  }

  return { mutate, isLoading, error }
}