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

export interface ErrorContext {
  userId?: string
  userEmail?: string
  userAgent?: string
  url?: string
  sessionId?: string
  [key: string]: any
}

export interface StructuredError {
  id: string
  timestamp: string
  context: string
  message: string
  code?: string
  type: ErrorType
  severity: ErrorSeverity
  userContext?: ErrorContext
  details?: any
  stack?: string
}

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  API = 'api',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export const createErrorState = (error?: string | null): ErrorState => ({
  error: error || null,
  isError: !!error,
})

export const clearErrorState = (): ErrorState => ({
  error: null,
  isError: false,
})

// Generate unique error ID
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Classify error type based on error message/code
const classifyError = (error: any): ErrorType => {
  const message = error?.message?.toLowerCase() || ''
  const code = error?.code?.toLowerCase() || ''
  
  if (message.includes('login') || message.includes('credentials') || 
      message.includes('unauthorized') || code.includes('auth')) {
    return ErrorType.AUTHENTICATION
  }
  if (message.includes('permission') || message.includes('forbidden') || 
      code === '403') {
    return ErrorType.AUTHORIZATION
  }
  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('required') || code.includes('validation')) {
    return ErrorType.VALIDATION
  }
  if (message.includes('network') || message.includes('fetch') || 
      message.includes('connection') || code.includes('network')) {
    return ErrorType.NETWORK
  }
  if (message.includes('database') || message.includes('query') || 
      code.includes('db') || code.includes('sql')) {
    return ErrorType.DATABASE
  }
  if (message.includes('api') || code.includes('api')) {
    return ErrorType.API
  }
  if (message.includes('client') || message.includes('browser')) {
    return ErrorType.CLIENT
  }
  
  return ErrorType.UNKNOWN
}

// Determine error severity
const determineSeverity = (errorType: ErrorType, error: any): ErrorSeverity => {
  const message = error?.message?.toLowerCase() || ''
  
  // Critical errors
  if (message.includes('critical') || message.includes('fatal') || 
      message.includes('corrupt')) {
    return ErrorSeverity.CRITICAL
  }
  
  // High severity
  if (errorType === ErrorType.DATABASE || errorType === ErrorType.API ||
      message.includes('timeout') || message.includes('server')) {
    return ErrorSeverity.HIGH
  }
  
  // Medium severity
  if (errorType === ErrorType.AUTHENTICATION || errorType === ErrorType.AUTHORIZATION ||
      errorType === ErrorType.NETWORK) {
    return ErrorSeverity.MEDIUM
  }
  
  // Low severity (validation, client errors)
  return ErrorSeverity.LOW
}

// Get user context from various sources
const getUserContext = (): ErrorContext => {
  const context: ErrorContext = {}
  
  if (typeof window !== 'undefined') {
    context.userAgent = window.navigator.userAgent
    context.url = window.location.href
    
    // Try to get user info from localStorage or sessionStorage
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        context.userId = user.id
        context.userEmail = user.email
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Try to get session ID
    try {
      const sessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId')
      if (sessionId) {
        context.sessionId = sessionId
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  return context
}

// Enhanced centralized error logging
export const logError = (context: string, error: any, userContext?: ErrorContext): StructuredError => {
  const errorType = classifyError(error)
  const severity = determineSeverity(errorType, error)
  const combinedContext = { ...getUserContext(), ...userContext }
  
  const structuredError: StructuredError = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || 'Unknown error',
    code: error?.code,
    type: errorType,
    severity,
    userContext: combinedContext,
    details: error?.details || error,
    stack: error?.stack
  }
  
  // Enhanced console logging with structured format
  const logLevel = severity === ErrorSeverity.CRITICAL ? 'error' : 
                   severity === ErrorSeverity.HIGH ? 'error' : 
                   severity === ErrorSeverity.MEDIUM ? 'warn' : 'error'
  
  console[logLevel](`🚨 [${severity.toUpperCase()}] ${context}`, {
    errorId: structuredError.id,
    type: errorType,
    message: structuredError.message,
    code: structuredError.code,
    timestamp: structuredError.timestamp,
    userContext: combinedContext,
    details: structuredError.details,
    stack: error?.stack
  })
  
  // In a real application, you would also send this to your logging service
  // Example: sendToLoggingService(structuredError)
  
  return structuredError
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
  if (message.includes('Server error') || message.includes('500')) {
    return 'Server error. Please try again later.'
  }
  if (message.includes('Service unavailable') || message.includes('503')) {
    return 'Service temporarily unavailable. Please try again later.'
  }
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  
  // Return original message if no specific mapping found
  return message || 'An unexpected error occurred'
}

// Enhanced toast error notification
export const showErrorToast = (error: any, context?: string, userContext?: ErrorContext) => {
  const structuredError = context ? logError(context, error, userContext) : null
  const message = getUserFriendlyErrorMessage(error)
  
  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  })
  
  return structuredError
}

// Toast success notification
export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
  })
}

// Enhanced async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    showToast?: boolean
    customErrorMessage?: string
    userContext?: ErrorContext
  }
): Promise<{ data: T | null; error: string | null; structuredError?: StructuredError }> => {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const structuredError = logError(context, error, options?.userContext)
    const errorMessage = options?.customErrorMessage || getUserFriendlyErrorMessage(error)
    
    if (options?.showToast !== false) {
      showErrorToast(error, context, options?.userContext)
    }
    
    return { data: null, error: errorMessage, structuredError }
  }
}

// Enhanced hook for async operations with loading and error states
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastError, setLastError] = React.useState<StructuredError | null>(null)
  
  const execute = async <T>(
    operation: () => Promise<T>,
    context: string,
    options?: {
      showToast?: boolean
      onSuccess?: (data: T) => void
      onError?: (error: string, structuredError?: StructuredError) => void
      userContext?: ErrorContext
    }
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    setLastError(null)
    
    try {
      const data = await operation()
      options?.onSuccess?.(data)
      return data
    } catch (err) {
      const structuredError = logError(context, err, options?.userContext)
      const errorMessage = getUserFriendlyErrorMessage(err)
      
      setError(errorMessage)
      setLastError(structuredError)
      
      if (options?.showToast !== false) {
        showErrorToast(err, context, options?.userContext)
      }
      
      options?.onError?.(errorMessage, structuredError)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  const clearError = () => {
    setError(null)
    setLastError(null)
  }
  
  return {
    isLoading,
    error,
    lastError,
    execute,
    clearError,
  }
}

// Error boundary helper for React components
export const createErrorBoundary = (fallbackComponent: React.ComponentType<{ error: Error; reset: () => void }>) => {
  return class extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logError('react-error-boundary', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      })
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallbackComponent
        return React.createElement(FallbackComponent, {
          error: this.state.error,
          reset: () => this.setState({ hasError: false, error: null })
        })
      }

      return this.props.children
    }
  }
}