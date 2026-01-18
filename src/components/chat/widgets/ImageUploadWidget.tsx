'use client'

/**
 * Image Upload Widget for Chat
 * Allows users to upload images within the chat interface
 */

import { useState, useRef } from 'react'
import { Upload, Check, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadImage } from '@/lib/firebase-storage'

interface ImageUploadWidgetProps {
  field: string
  config?: {
    accept?: string
    maxSize?: number
    label?: string
  }
  onComplete: (url: string) => void
  disabled?: boolean
}

export function ImageUploadWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: ImageUploadWidgetProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accept = config.accept || 'image/*'
  const maxSize = config.maxSize || 5 * 1024 * 1024 // 5MB default
  const label = config.label || 'Upload Image'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    try {
      setUploading(true)

      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Determine folder based on field type
      let folder = 'images'
      if (field === 'logo_url' || field.includes('logo')) {
        folder = 'logos'
      } else if (field.includes('product')) {
        folder = 'products'
      } else if (field.includes('team')) {
        folder = 'team'
      } else if (field.includes('certificate')) {
        folder = 'certificates'
      }

      // Upload to Firebase Storage
      const url = await uploadImage(file, folder)

      setUploadedUrl(url)
      toast.success('Image uploaded successfully!')
      onComplete(url)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadedUrl(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload Area */}
      {!uploadedUrl && !preview && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            {label}
          </div>

          <Button
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            variant="outline"
            className="w-full border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all duration-200"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      )}

      {/* Preview / Uploaded State */}
      {(preview || uploadedUrl) && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview || uploadedUrl || ''}
              alt="Upload preview"
              className="w-full h-48 object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              </div>
            )}

            {uploadedUrl && !uploading && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>

          {uploadedUrl && !disabled && (
            <div className="flex gap-2">
              <Button
                onClick={handleRemove}
                variant="outline"
                size="sm"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
              <Button
                onClick={handleButtonClick}
                variant="outline"
                size="sm"
                className="flex-1 border-teal-200 text-teal-600 hover:bg-teal-50"
              >
                <Upload className="w-4 h-4 mr-1" />
                Change
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}