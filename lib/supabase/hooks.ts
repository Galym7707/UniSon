import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from './browser'
import { useAsyncOperation } from '../error-handling'

// Hook for getting current user with error handling
export const useUser = () => {
  const [user, setUser] = useState<any>(null)
  const { isLoading, error, execute } = useAsyncOperation()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabaseBrowser()
      const result = await supabase.auth.getUser()
      if (result.data?.user) {
        setUser(result.data.user)
      }
      return result
    }

    execute(loadUser, 'get-user', {
      onError: () => {
        // Silent error handling for user loading
      },
    })
  }, [execute])

  return { user, isLoading, error }
}

// Hook for authentication state changes
export const useAuthState = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
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
    const supabase = getSupabaseBrowser()
    execute(() => queryFn(supabase), 'supabase-query').then((result) => {
      if (result?.data) {
        setData(result.data)
      }
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
  }
) => {
  const { isLoading, error, execute } = useAsyncOperation()

  const mutate = async (params: P) => {
    const supabase = getSupabaseBrowser()
    return execute(
      async () => {
        const result = await mutationFn(supabase, params)
        if (result.error) throw new Error(result.error.message)
        return result.data
      },
      'supabase-mutation',
      {
        onError: options?.onError ? (msg, err) => options.onError!(msg) : undefined,
      }
    ).then((result) => {
      if (result && options?.onSuccess) {
        options.onSuccess(result)
      }
      return result
    })
  }

  return { mutate, isLoading, error }
}