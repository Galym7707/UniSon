"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

interface UserAvatarProps {
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const UserAvatar = React.forwardRef<
  HTMLDivElement,
  UserAvatarProps
>(({ firstName, lastName, profileImageUrl, className, size = "md" }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  }

  // Generate initials with safe fallbacks
  const getInitials = () => {
    const first = firstName?.trim() || ""
    const last = lastName?.trim() || ""
    
    if (first && last) {
      return `${first.charAt(0).toUpperCase()}${last.charAt(0).toUpperCase()}`
    } else if (first) {
      return first.charAt(0).toUpperCase()
    } else if (last) {
      return last.charAt(0).toUpperCase()
    }
    return "U" // Ultimate fallback
  }

  const initials = getInitials()
  const altText = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || lastName || "User"

  return (
    <Avatar
      ref={ref}
      className={cn(sizeClasses[size], className)}
    >
      {profileImageUrl && (
        <AvatarImage
          src={profileImageUrl}
          alt={altText}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
})

UserAvatar.displayName = "UserAvatar"

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }