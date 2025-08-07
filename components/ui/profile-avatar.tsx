'use client'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import ImageUpload from './image-upload'

interface ProfileAvatarProps {
  imageUrl?: string | null
  fallbackText: string
  onImageChange: (imageUrl: string | null) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  allowEdit?: boolean
  bucketName: string
  folder?: string
  disabled?: boolean
}

export default function ProfileAvatar({
  imageUrl,
  fallbackText,
  onImageChange,
  size = 'lg',
  allowEdit = true,
  bucketName,
  folder = 'avatars',
  disabled = false
}: ProfileAvatarProps) {
  if (!allowEdit) {
    return (
      <Avatar className={
        size === 'sm' ? 'w-16 h-16' :
        size === 'md' ? 'w-24 h-24' :
        size === 'lg' ? 'w-32 h-32' :
        'w-40 h-40'
      }>
        <AvatarImage src={imageUrl || ''} />
        <AvatarFallback className="text-lg font-medium">
          {fallbackText.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <ImageUpload
      currentImageUrl={imageUrl}
      onImageChange={onImageChange}
      bucketName={bucketName}
      folder={folder}
      fallbackText={fallbackText}
      size={size}
      variant="avatar"
      allowDelete={true}
      disabled={disabled}
    />
  )
}