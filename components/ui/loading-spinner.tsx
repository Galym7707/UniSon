import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

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
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Loading...", 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={isLoading || disabled}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}