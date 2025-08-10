"use client"

import * as React from 'react'
import { isHydrationError, logError, createStructuredError, type HydrationErrorContext, detectBrowserExtensions, getUserFriendlyErrorMessage } from '@/lib/error-handling'

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    maxRetries?: number
  }>,
  { hasError: boolean; error: Error | null; retryCount: number; isHydrationError: boolean }
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
        return React.createElement(FallbackComponent, { error: this.state.error, retry: this.retry })
      }

      // Default fallback UI
      return React.createElement(
        'div',
        { className: 'error-boundary' },
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null, getUserFriendlyErrorMessage(this.state.error)),
        React.createElement('button', { onClick: this.retry }, 'Try Again')
      )
    }

    return this.props.children
  }
}


