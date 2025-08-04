import React from "react"
import { toast } from "@/hooks/use-toast"

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ErrorState {
  error: string | null
  isError: boolean
}

export const createErrorState = (error?: string | null): ErrorState => ({
  error: error || null,
  isError: !!error,
})

export const clearErrorState = (): ErrorState => ({
  error: null,
  isError: false,
})

// Centralized error logging
export const logError = (context: string, error: any) => {
  const errorInfo = {
    context,
    message: error?.message || 'Unknown error',
    code: error?.code,
    details: error?.details || error,
    timestamp: new Date().toISOString(),
  }
  
  console.error(`[${context}]`, errorInfo)
  return errorInfo
}

// Standardized error message extraction
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error_description) return error.error_description
  if (error?.details) return error.details
  return 'An unexpected error occurred'
}

// User-friendly error messages for common Supabase errors
export const getUserFriendlyErrorMessage = (error: any): string => {
  const message = getErrorMessage(error)
  
  // Common Supabase auth errors
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.'
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  if (message.includes('Invalid email')) {
    return 'Please enter a valid email address.'
  }
  if (message.includes('Network error') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (message.includes('Unauthorized') || message.includes('401')) {
    return 'Your session has expired. Please sign in again.'
  }
  if (message.includes('Forbidden') || message.includes('403')) {
    return 'You do not have permission to perform this action.'
  }
  if (message.includes('Not found') || message.includes('404')) {
    return 'The requested resource was not found.'
  }
  if (message.includes('Too many requests') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  
  // Return original message if no specific mapping found
  return message || 'An unexpected error occurred'
}

// Toast error notification
export const showErrorToast = (error: any, context?: string) => {
  const message = getUserFriendlyErrorMessage(error)
  
  if (context) {
    logError(context, error)
  }
  
  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  })
}

// Toast success notification
export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
  })
}

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    showToast?: boolean
    customErrorMessage?: string
  }
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    logError(context, error)
    const errorMessage = options?.customErrorMessage || getUserFriendlyErrorMessage(error)
    
    if (options?.showToast !== false) {
      showErrorToast(error, context)
    }
    
    return { data: null, error: errorMessage }
  }
}

// Hook for async operations with loading and error states
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const execute = async <T>(
    operation: () => Promise<T>,
    context: string,
    options?: {
      showToast?: boolean
      onSuccess?: (data: T) => void
      onError?: (error: string) => void
    }
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await operation()
      options?.onSuccess?.(data)
      return data
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError(context, err)
      setError(errorMessage)
      
      if (options?.showToast !== false) {
        showErrorToast(err, context)
      }
      
      options?.onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  const clearError = () => setError(null)
  
  return {
    isLoading,
    error,
    execute,
    clearError,
  }
}