import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-8 w-8": size === "lg",
        },
        className
      )}
    />
  )
}

interface LoadingButtonProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
}

export function LoadingButton({ isLoading, children, loadingText = "Loading..." }: LoadingButtonProps) {
  if (isLoading) {
    return (
      <span className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        {loadingText}
      </span>
    )
  }
  return <>{children}</>
}