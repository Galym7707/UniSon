'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Upload, X, Camera, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { LoadingSpinner, LoadingButton } from './loading-spinner'
import { ErrorDisplay } from './error-display'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { getUserFriendlyErrorMessage, logError, showSuccessToast, showErrorToast } from '@/lib/error-handling'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageChange: (imageUrl: string | null) => void
  bucketName: string
  folder?: string
  maxSizeBytes?: number
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'avatar' | 'card'
  allowDelete?: boolean
  disabled?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32',
  xl: 'w-40 h-40'
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
  bucketName,
  folder = 'uploads',
  maxSizeBytes = DEFAULT_MAX_SIZE,
  fallbackText = 'Upload Image',
  size = 'lg',
  variant = 'avatar',
  allowDelete = true,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseBrowser()

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP).'
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024))
      return `File size must be less than ${maxSizeMB}MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`
    }

    return null
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error(`Authentication error: ${authError.message}`)
      if (!user) throw new Error('Please sign in to upload images')

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // Handle specific storage errors
        if (uploadError.message.includes('duplicate')) {
          throw new Error('A file with this name already exists. Please try again.')
        }
        if (uploadError.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please contact support.')
        }
        if (uploadError.message.includes('size')) {
          throw new Error('File is too large. Please upload a smaller image.')
        }
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      if (!publicUrl) {
        throw new Error('Failed to get image URL. Please try again.')
      }

      // Update profile with new image URL
      await updateProfileImage(publicUrl)
      
      onImageChange(publicUrl)
      showSuccessToast('Image uploaded successfully')

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('image-upload', err, {
        bucketName,
        folder,
        fileSize: file.size,
        fileType: file.type
      })
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const updateProfileImage = async (imageUrl: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return

    // Determine which table to update based on context
    const isEmployer = window.location.pathname.includes('/employer')
    const tableName = isEmployer ? 'company_profiles' : 'profiles'
    const imageField = isEmployer ? 'logo_url' : 'avatar_url'

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ [imageField]: imageUrl, updated_at: new Date().toISOString() })
      .eq(isEmployer ? 'user_id' : 'id', user.id)

    if (updateError) {
      logError('profile-image-update', updateError)
      // Don't throw here - the image was uploaded successfully
    }
  }

  const handleDelete = async () => {
    if (!currentImageUrl) return

    try {
      setDeleting(true)
      setError(null)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Authentication required')

      // Extract file path from URL
      const url = new URL(currentImageUrl)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(-2).join('/') // folder/filename

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (deleteError) {
        logError('image-delete-storage', deleteError)
        // Continue to update profile even if storage deletion fails
      }

      // Update profile to remove image URL
      await updateProfileImage('')
      
      onImageChange(null)
      showSuccessToast('Image deleted successfully')

    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      logError('image-delete', err)
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const clearError = () => setError(null)

  if (variant === 'avatar') {
    return (
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentImageUrl || ''} />
          <AvatarFallback className="text-lg font-medium">
            {fallbackText.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-2 hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || deleting}
        >
          {uploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Camera className="h-3 w-3" />
          )}
        </Button>

        {/* Delete button */}
        {allowDelete && currentImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 border-red-500 hover:bg-red-600 text-white"
            onClick={handleDelete}
            disabled={disabled || uploading || deleting}
          >
            {deleting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || deleting}
        />

        {error && (
          <div className="absolute top-full mt-2 w-64">
            <ErrorDisplay
              error={error}
              onDismiss={clearError}
              variant="inline"
            />
          </div>
        )}
      </div>
    )
  }

  // Card variant
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${currentImageUrl 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-blue-400'
          }
          ${disabled || uploading || deleting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && !uploading && !deleting && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Uploading image...</p>
          </div>
        ) : currentImageUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={currentImageUrl}
                alt="Uploaded image"
                className="max-h-32 max-w-full rounded-lg object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-green-700 font-medium">✓ Image uploaded successfully</p>
              <p className="text-sm text-gray-500">Click to replace the current image</p>
              {allowDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={disabled || uploading || deleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <LoadingButton isLoading={deleting} loadingText="Deleting...">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Image
                  </LoadingButton>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="font-medium">{fallbackText}</p>
              <p className="text-sm text-gray-500 mt-1">
                Click here or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP up to {Math.round(maxSizeBytes / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || deleting}
        />
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          variant="card"
        />
      )}
    </div>
  )
}