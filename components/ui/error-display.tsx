import { AlertCircle, RefreshCw, X, Bug, Wifi, Shield, AlertTriangle } from "lucide-react"
import { Button } from "./button"
import { Alert, AlertDescription } from "./alert"
import { cn } from "@/lib/utils"
import { ErrorType, ErrorSeverity } from "@/lib/error-handling"

interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: "inline" | "card" | "toast"
  errorType?: ErrorType
  severity?: ErrorSeverity
  errorId?: string
  showErrorId?: boolean
}

const getErrorIcon = (errorType?: ErrorType, severity?: ErrorSeverity) => {
  if (severity === ErrorSeverity.CRITICAL) {
    return <Bug className="h-4 w-4" />
  }
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return <Wifi className="h-4 w-4" />
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return <Shield className="h-4 w-4" />
    case ErrorType.VALIDATION:
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getSeverityColor = (severity?: ErrorSeverity) => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return "text-red-900 bg-red-100 border-red-300"
    case ErrorSeverity.HIGH:
      return "text-red-800 bg-red-50 border-red-200"
    case ErrorSeverity.MEDIUM:
      return "text-orange-800 bg-orange-50 border-orange-200"
    case ErrorSeverity.LOW:
      return "text-yellow-800 bg-yellow-50 border-yellow-200"
    default:
      return "text-red-700 bg-red-50 border-red-200"
  }
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className,
  variant = "inline",
  errorType,
  severity,
  errorId,
  showErrorId = false
}: ErrorDisplayProps) {
  if (!error) return null

  const Icon = getErrorIcon(errorType, severity)
  const severityColors = getSeverityColor(severity)

  const baseContent = (
    <>
      {Icon}
      <AlertDescription className="flex-1">
        {error}
        {showErrorId && errorId && (
          <div className="text-xs opacity-75 mt-1">
            Error ID: {errorId}
          </div>
        )}
      </AlertDescription>
      <div className="flex gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </>
  )

  if (variant === "card") {
    return (
      <div className={cn(
        "rounded-lg border p-4",
        severityColors,
        className
      )}>
        <div className="flex items-center gap-3">
          {baseContent}
        </div>
      </div>
    )
  }

  const alertVariant = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH 
    ? "destructive" 
    : "default"

  return (
    <Alert variant={alertVariant} className={cn("flex items-center gap-3", className)}>
      {baseContent}
    </Alert>
  )
}

interface InlineErrorProps {
  error: string | null
  className?: string
  errorType?: ErrorType
  severity?: ErrorSeverity
}

export function InlineError({ error, className, errorType, severity }: InlineErrorProps) {
  if (!error) return null
  
  const Icon = getErrorIcon(errorType, severity)
  const textColor = severity === ErrorSeverity.CRITICAL ? "text-red-900" :
                   severity === ErrorSeverity.HIGH ? "text-red-700" :
                   severity === ErrorSeverity.MEDIUM ? "text-orange-600" :
                   severity === ErrorSeverity.LOW ? "text-yellow-600" :
                   "text-red-600"
  
  return (
    <p className={cn("text-sm mt-1 flex items-center gap-1", textColor, className)}>
      {Icon}
      {error}
    </p>
  )
}