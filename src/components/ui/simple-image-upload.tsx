"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SimpleImageUploadProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  icon?: React.ComponentType<any>
  iconColor?: string
  required?: boolean
}

export function SimpleImageUpload({
  value,
  onValueChange,
  placeholder = "Enter image URL",
  className,
  label,
  icon: Icon,
  iconColor = '#14B8A6',
  required = false
}: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file (JPG, PNG, GIF, WebP)')
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('Image file size must be less than 5MB')
      }

      // Create a data URL for preview (temporary solution)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreviewUrl(dataUrl)
        onValueChange?.(dataUrl)
        toast.success('Image loaded successfully! (Note: This is a preview URL)')
        setIsUploading(false)
      }
      
      reader.onerror = () => {
        throw new Error('Failed to read the image file')
      }

      reader.readAsDataURL(file)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setIsUploading(false)
      toast.error(errorMessage)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearValue = () => {
    onValueChange?.('')
    setPreviewUrl(null)
    setError(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="space-y-3">
        {/* URL Input */}
        <div className="relative">
          {Icon && (
            <Icon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" 
              style={{ color: iconColor }} 
            />
          )}
          <Input
            value={value || ''}
            onChange={(e) => onValueChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "border-2 border-teal-200/50 focus:border-teal-500",
              Icon ? "pl-10" : "",
              className
            )}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              onClick={clearValue}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Upload Section */}
        <div className="relative">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
              dragOver ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/30",
              isUploading && "pointer-events-none opacity-60"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              {isUploading ? (
                <>
                  <Upload className="h-6 w-6 text-teal-500 animate-pulse" />
                  <p className="text-sm text-gray-600">Processing image...</p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-teal-600 hover:text-teal-700">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    Images only • Max 5MB
                    <br />
                    Note: Creates preview URL (for Firebase, enable authentication)
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Preview:</Label>
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ This is a preview URL. For production, enable Firebase authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}