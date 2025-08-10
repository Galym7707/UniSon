"use client"

import React from "react"
import { ErrorFallback } from "@/components/error-boundary"
import { logError, ErrorContext, StructuredError } from "@/lib/error-handling"

interface HydrationErrorContext extends ErrorContext {
  isHydrationError: boolean
  hydrationDetails?: {
    errorType: 'hydration_failed' | 'content_mismatch' | 'other_hydration'
    browserExtensions?: string[]
    userAgent: string
    viewport: {
      width: number
      height: number
    }
    timing: {
      domContentLoaded?: number
      hydrationTime?: number
    }
  }
}

// Specialized logging function for hydration errors
const logHydrationError = (error: Error, errorInfo: React.ErrorInfo): StructuredError => {
  const errorMessage = error.message.toLowerCase()
  
  // Detect hydration error type
  let hydrationErrorType: 'hydration_failed' | 'content_mismatch' | 'other_hydration' = 'other_hydration'
  if (errorMessage.includes('hydration failed')) {
    hydrationErrorType = 'hydration_failed'
  } else if (errorMessage.includes('text content does not match server-rendered html')) {
    hydrationErrorType = 'content_mismatch'
  }

  // Detect browser extensions (common cause of hydration issues)
  const detectBrowserExtensions = (): string[] => {
    if (typeof window === 'undefined') return []
    
    const extensions: string[] = []
    
    // Common extension indicators
    if ((window as any).chrome?.extension) extensions.push('chrome-extension')
    if ((window as any).browser?.extension) extensions.push('browser-extension')
    if (document.querySelector('[data-grammarly]')) extensions.push('grammarly')
    if (document.querySelector('[data-lastpass]')) extensions.push('lastpass')
    if (document.querySelector('[data-adblock]')) extensions.push('adblock')
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) extensions.push('react-devtools')
    
    // Check for modified DOM that might indicate extensions
    const suspiciousElements = document.querySelectorAll('[id^="ext-"], [class^="ext-"], [data-extension]')
    if (suspiciousElements.length > 0) extensions.push('unknown-extension')
    
    return extensions
  }

  // Get timing information
  const getTimingInfo = () => {
    if (typeof window === 'undefined' || !window.performance) return {}
    
    const timing = window.performance.timing
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
    const hydrationTime = Date.now() - timing.navigationStart
    
    return {
      domContentLoaded,
      hydrationTime
    }
  }

  // Get viewport information
  const getViewportInfo = () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  const hydrationContext: HydrationErrorContext = {
    isHydrationError: true,
    hydrationDetails: {
      errorType: hydrationErrorType,
      browserExtensions: detectBrowserExtensions(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      viewport: getViewportInfo(),
      timing: getTimingInfo()
    },
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  }

  // Log with enhanced context
  const structuredError = logError('hydration-error', error, hydrationContext)
  
  // Additional console logging specifically for hydration debugging
  console.group('🌊 Hydration Error Detected')
  console.error('Error Type:', hydrationErrorType)
  console.error('Error Message:', error.message)
  console.error('Component Stack:', errorInfo.componentStack)
  console.error('Browser Extensions Detected:', hydrationContext.hydrationDetails?.browserExtensions)
  console.error('Viewport:', hydrationContext.hydrationDetails?.viewport)
  console.error('Timing:', hydrationContext.hydrationDetails?.timing)
  console.error('Full Error Object:', error)
  console.error('Error Info:', errorInfo)
  console.groupEnd()

  return structuredError
}

// Check if error is a hydration error
const isHydrationError = (error: Error): boolean => {
  const message = error.message.toLowerCase()
  return (
    message.includes('hydration failed') ||
    message.includes('text content does not match server-rendered html') ||
    message.includes('hydration')
  )
}

export class GlobalErrorBoundary extends React.Component<
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
    // Check if this is a hydration error and use specialized logging
    if (isHydrationError(error)) {
      logHydrationError(error, errorInfo)
    } else {
      // Use standard error logging for non-hydration errors
      logError('react-error-boundary', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      })
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}