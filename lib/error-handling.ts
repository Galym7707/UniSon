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
  HYDRATION = 'hydration',
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

// Hydration error detection utilities
export const isHydrationError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || ''
  const stack = error?.stack?.toLowerCase() || ''
  
  return (
    message.includes('hydration') ||
    message.includes('hydrating') ||
    message.includes('text content does not match') ||
    message.includes('text content did not match') ||
    message.includes('expected server html to contain') ||
    message.includes('did not expect server html to contain') ||
    message.includes('hydratingelement') ||
    message.includes('hydration failed because the initial ui does not match') ||
    stack.includes('hydrat') ||
    stack.includes('hydrateroot') ||
    (message.includes('error') && message.includes('server') && message.includes('client'))
  )
}

// Detect browser extension interference
const detectBrowserExtensions = (): string[] => {
  const extensions: string[] = []
  
  if (typeof window !== 'undefined') {
    // Common extension-injected elements/properties
    if ((window as any).chrome?.runtime) extensions.push('chrome-extension')
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) extensions.push('react-devtools')
    if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) extensions.push('redux-devtools')
    if (document.querySelector('[data-lastpass-icon-root]')) extensions.push('lastpass')
    if (document.querySelector('[data-dashlane-rid]')) extensions.push('dashlane')
    if (document.querySelector('[data-onepassword-extension]')) extensions.push('1password')
    if (document.querySelector('grammarly-extension')) extensions.push('grammarly')
    if (document.querySelector('[data-adblock]') || document.querySelector('.adsbygoogle')) extensions.push('adblocker')
    
    // Check for modified DOM that might indicate extensions
    const bodyClasses = document.body.className
    if (bodyClasses.includes('ext-') || bodyClasses.includes('extension-')) {
      extensions.push('unknown-extension')
    }
  }
  
  return extensions
}

// Enhanced hydration error context
export interface HydrationErrorContext extends ErrorContext {
  isHydrationError: boolean
  expectedContent?: string
  actualContent?: string
  browserExtensions: string[]
  retryCount: number
  componentStack?: string
  elementType?: string
  renderPhase: 'server' | 'client' | 'unknown'
}

// Classify error type based on error message/code
const classifyError = (error: any): ErrorType => {
  const message = error?.message?.toLowerCase() || ''
  const code = error?.code?.toLowerCase() || ''
  
  // Check for hydration errors first
  if (isHydrationError(error)) {
    return ErrorType.HYDRATION
  }
  
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
      errorType === ErrorType.NETWORK || errorType === ErrorType.HYDRATION) {
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

export const logInfo = (ctx: string, payload: any) => {
  console.info(`ℹ️ [${ctx}]`, payload)
  /* optionally insert into Supabase edge_logs */
}

// Enhanced centralized error logging with hydration-specific handling
export const logError = (context: string, error: any, userContext?: ErrorContext): StructuredError => {
  const errorType = classifyError(error)
  const severity = determineSeverity(errorType, error)
  const combinedContext = { ...getUserContext(), ...userContext }
  
  // Enhanced context for hydration errors
  if (errorType === ErrorType.HYDRATION) {
    const hydrationContext: HydrationErrorContext = {
      ...combinedContext,
      isHydrationError: true,
      browserExtensions: detectBrowserExtensions(),
      retryCount: (userContext as HydrationErrorContext)?.retryCount || 0,
      renderPhase: 'client' as const, // Most hydration errors occur during client hydration
      componentStack: (userContext as HydrationErrorContext)?.componentStack,
      elementType: (userContext as HydrationErrorContext)?.elementType,
      expectedContent: (userContext as HydrationErrorContext)?.expectedContent,
      actualContent: (userContext as HydrationErrorContext)?.actualContent
    }
    combinedContext.hydrationContext = hydrationContext
  }
  
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
  
  if (errorType === ErrorType.HYDRATION) {
    console.groupCollapsed(`🔄 [HYDRATION ERROR] ${context}`)
    console.error('Error ID:', structuredError.id)
    console.error('Message:', structuredError.message)
    console.error('Browser Extensions:', (combinedContext as any).hydrationContext?.browserExtensions || [])
    console.error('Retry Count:', (combinedContext as any).hydrationContext?.retryCount || 0)
    console.error('Component Stack:', (combinedContext as any).hydrationContext?.componentStack || 'Not available')
    console.error('Full Error Details:', error)
    console.error('Stack Trace:', error?.stack)
    console.groupEnd()
  } else {
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
  }
  
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

// User-friendly error messages for common Supabase errors and hydration errors
export const getUserFriendlyErrorMessage = (error: any): string => {
  const message = getErrorMessage(error)
  
  // Hydration error messages
  if (isHydrationError(error)) {
    return 'The page is experiencing display issues. This is usually temporary and will resolve automatically.'
  }
  
  // Common Supabase auth errors
  if (message.includes('User already registered')) return 'E-mail already registered'

  if (message.includes('Email rate limit')) return 'Too many signup attempts – try later'

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
  
  // Don't show toast for hydration errors to avoid user confusion
  if (isHydrationError(error)) {
    return structuredError
  }
  
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

// Enhanced error boundary helper for React components with hydration support
export const createErrorBoundary = (fallbackComponent: React.ComponentType<{ error: Error; reset: () => void; isHydrationError?: boolean }>) => {
  return class extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; retryCount: number; isHydrationError: boolean }
  > {
    private retryTimeoutId: NodeJS.Timeout | null = null
    private maxRetries = 3
    private retryDelay = 1000 // 1 second

    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false, error: null, retryCount: 0, isHydrationError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { 
        hasError: true, 
        error,
        isHydrationError: isHydrationError(error)
      }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const hydrationContext: HydrationErrorContext = {
        isHydrationError: isHydrationError(error),
        componentStack: errorInfo.componentStack,
        browserExtensions: detectBrowserExtensions(),
        retryCount: this.state.retryCount,
        renderPhase: 'client'
      }

      logError('react-error-boundary', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        ...(hydrationContext.isHydrationError ? { hydrationContext } : {})
      })

      // Auto-retry for hydration errors
      if (hydrationContext.isHydrationError && this.state.retryCount < this.maxRetries) {
        this.scheduleRetry()
      }
    }

    scheduleRetry = () => {
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          retryCount: prevState.retryCount + 1
        }))
      }, this.retryDelay * (this.state.retryCount + 1)) // Exponential backoff
    }

    componentWillUnmount() {
      if (this.retryTimeoutId) {
        clearTimeout(this.retryTimeoutId)
      }
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const FallbackComponent = fallbackComponent
        return React.createElement(FallbackComponent, {
          error: this.state.error,
          isHydrationError: this.state.isHydrationError,
          reset: () => this.setState({ hasError: false, error: null, retryCount: 0 })
        })
      }

      return this.props.children
    }
  }
}