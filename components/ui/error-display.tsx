import { AlertCircle, RefreshCw, X } from "lucide-react"
import { Button } from "./button"
import { Alert, AlertDescription } from "./alert"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: "inline" | "card" | "toast"
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className,
  variant = "inline" 
}: ErrorDisplayProps) {
  if (!error) return null

  const baseContent = (
    <>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex-1">
        {error}
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
        "rounded-lg border border-red-200 bg-red-50 p-4",
        className
      )}>
        <div className="flex items-center gap-3 text-red-700">
          {baseContent}
        </div>
      </div>
    )
  }

  return (
    <Alert variant="destructive" className={cn("flex items-center gap-3", className)}>
      {baseContent}
    </Alert>
  )
}

interface InlineErrorProps {
  error: string | null
  className?: string
}

export function InlineError({ error, className }: InlineErrorProps) {
  if (!error) return null
  
  return (
    <p className={cn("text-sm text-red-600 mt-1 flex items-center gap-1", className)}>
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  )
}