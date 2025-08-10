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
  componentStack?: string | null
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
  
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION
  }
  
  if (message.includes('validation') || message.includes('invalid') || 
      code.includes('validation')) {
    return ErrorType.VALIDATION
  }
  
  if (message.includes('network') || message.includes('fetch') || 
      message.includes('connection') || code.includes('network')) {
    return ErrorType.NETWORK
  }
  
  if (message.includes('database') || message.includes('sql') || 
      code.includes('db')) {
    return ErrorType.DATABASE
  }
  
  if (message.includes('api') || code.includes('api')) {
    return ErrorType.API
  }
  
  return ErrorType.UNKNOWN
}

// Determine error severity
const classifySeverity = (error: any): ErrorSeverity => {
  const type = classifyError(error)
  
  switch (type) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.HIGH
    case ErrorType.DATABASE:
    case ErrorType.API:
      return ErrorSeverity.CRITICAL
    case ErrorType.NETWORK:
      return ErrorSeverity.MEDIUM
    case ErrorType.VALIDATION:
      return ErrorSeverity.LOW
    case ErrorType.HYDRATION:
      return ErrorSeverity.MEDIUM
    case ErrorType.CLIENT:
      return ErrorSeverity.LOW
    default:
      return ErrorSeverity.MEDIUM
  }
}

// Create structured error object
export const createStructuredError = (
  context: string,
  error: Error | any,
  userContext?: ErrorContext
): StructuredError => {
  const type = classifyError(error)
  const severity = classifySeverity(error)
  
  return {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || 'Unknown error',
    code: error?.code,
    type,
    severity,
    userContext,
    details: error?.details || error?.cause,
    stack: error?.stack
  }
}

// Enhanced error logging
export const logError = (
  context: string, 
  error: Error | any, 
  additionalContext?: any,
  notify: boolean = true
) => {
  const structuredError = createStructuredError(context, error, additionalContext)
  
  // Console logging with appropriate level
  const logMethod = structuredError.severity === ErrorSeverity.CRITICAL ? 
    console.error : 
    structuredError.severity === ErrorSeverity.HIGH ? 
      console.error : 
      structuredError.severity === ErrorSeverity.MEDIUM ? 
        console.warn : 
        console.info

  logMethod('Error:', {
    id: structuredError.id,
    context: structuredError.context,
    message: structuredError.message,
    type: structuredError.type,
    severity: structuredError.severity,
    timestamp: structuredError.timestamp,
    stack: structuredError.stack,
    userContext: structuredError.userContext,
    details: structuredError.details
  })

  // Show user notification for appropriate severities
  if (notify && structuredError.severity !== ErrorSeverity.LOW) {
    const userMessage = getUserFriendlyMessage(structuredError)
    toast({
      title: "Error",
      description: userMessage,
      variant: structuredError.severity === ErrorSeverity.CRITICAL ? "destructive" : "default",
    })
  }

  // Here you could send to external monitoring service
  // sendToMonitoring(structuredError)

  return structuredError
}

// Get user-friendly error messages
const getUserFriendlyMessage = (error: StructuredError): string => {
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return "Please log in to continue."
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action."
    case ErrorType.VALIDATION:
      return "Please check your input and try again."
    case ErrorType.NETWORK:
      return "Network error. Please check your connection and try again."
    case ErrorType.DATABASE:
    case ErrorType.API:
      return "Service temporarily unavailable. Please try again later."
    case ErrorType.HYDRATION:
      return "The page is reloading to fix a display issue."
    default:
      return "An unexpected error occurred. Please try again."
  }
}

// React Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
  isHydrationError: boolean
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    maxRetries?: number
  }>,
  ErrorBoundaryState
> {
  private retryTimeoutId: number | null = null
  private maxRetries: number

  constructor(props: any) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isHydrationError: false
    }
    this.maxRetries = props.maxRetries || 3
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
      componentStack: errorInfo.componentStack || undefined,
      browserExtensions: detectBrowserExtensions(),
      retryCount: this.state.retryCount,
      renderPhase: 'client'
    }

    logError('react-error-boundary', error, {
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: true,
      ...(hydrationContext.isHydrationError ? { hydrationContext } : {})
    })

    // Auto-retry for hydration errors
    if (hydrationContext.isHydrationError && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry()
    }

    this.props.onError?.(error, errorInfo)
  }

  private scheduleRetry = () => {
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }))
    }, 1000 + this.state.retryCount * 1000) // Exponential backoff
  }

  private retry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    })
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{getUserFriendlyMessage(createStructuredError('error-boundary', this.state.error))}</p>
          <button onClick={this.retry}>Try Again</button>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = React.useCallback((context: string, error: Error | any, notify: boolean = true) => {
    return logError(context, error, undefined, notify)
  }, [])

  return { handleError }
}

// Async error handler for promises
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  context: string,
  fallback?: T
): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    logError(context, error)
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

// Error recovery utilities
export const withErrorRecovery = <T extends any[], R>(
  fn: (...args: T) => R,
  context: string,
  fallback?: R
) => {
  return (...args: T): R => {
    try {
      return fn(...args)
    } catch (error) {
      logError(context, error)
      if (fallback !== undefined) {
        return fallback
      }
<<<<<<< HEAD
      throw error
=======
      
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
        componentStack: errorInfo.componentStack || undefined,
        browserExtensions: detectBrowserExtensions(),
        retryCount: this.state.retryCount,
        renderPhase: 'client'
      }

      logError('react-error-boundary', error, {
        componentStack: errorInfo.componentStack || undefined,
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
>>>>>>> 8322518 (Test employer page navigation, settings functionality, and complete job creation workflow)
    }
  }
}
