"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Image, FileText, Check, AlertTriangle, Replace } from "lucide-react"
import { uploadImage, uploadPDF, getImageUploadSettings, deleteFile } from "@/lib/firebase-storage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  type?: 'logo' | 'product' | 'certificate' | 'team' | 'document'
  acceptPDF?: boolean
  icon?: React.ComponentType<any> | React.ReactElement
  iconColor?: string
  required?: boolean
}

export function ImageUpload({
  value,
  onValueChange,
  placeholder = "Upload file or enter URL",
  className,
  label,
  type = 'product',
  acceptPDF = false,
  icon: Icon,
  iconColor = '#14B8A6',
  required = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const settings = getImageUploadSettings(type)
  const acceptedTypes = acceptPDF 
    ? [...(settings?.acceptedTypes || []), 'application/pdf'].join(',')
    : (settings?.acceptedTypes || []).join(',')

  // Extract filename from URL (for display)
  const getFileName = (url: string): string => {
    if (uploadedFileName) return uploadedFileName
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || 'file'
      // Clean up Firebase storage names
      return fileName.split('?')[0].split('%2F').pop()?.split('_').slice(1).join('_') || fileName
    } catch {
      return 'file'
    }
  }

  const isFileUploaded = value && (value.includes('firebase') || uploadedFileName)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    console.log('Starting file upload:', file.name, file.type, file.size)
    
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)
    setUploadedFileName(file.name)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      let downloadURL: string

      if (file.type === 'application/pdf') {
        if (!acceptPDF) {
          throw new Error('PDF files are not allowed for this field')
        }
        downloadURL = await uploadPDF(file, settings?.folder || 'documents')
      } else {
        downloadURL = await uploadImage(file, settings?.folder || 'images')
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log('Upload successful, URL:', downloadURL)

      // Update the value
      onValueChange?.(downloadURL)
      
      toast.success(`${file.type === 'application/pdf' ? 'PDF' : 'Image'} uploaded successfully!`)
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (err) {
      console.error('Upload failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
      setUploadedFileName(null)
      toast.error(errorMessage)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Don't clear the input here - let it be cleared manually in clearValue
  }

  const clearValue = async () => {
    console.log('Clearing value, current value:', value)
    
    // If there's a Firebase URL, delete the file from storage
    if (value && value.includes('firebase')) {
      setIsDeleting(true)
      try {
        await deleteFile(value)
        toast.success('File deleted successfully')
      } catch (error) {
        console.error('Error deleting file:', error)
        toast.error('Failed to delete file, but removing from form')
      } finally {
        setIsDeleting(false)
      }
    }
    
    // Clear the form state and reset file input
    onValueChange?.('')
    setError(null)
    setUploadedFileName(null)
    setIsUploading(false)
    setUploadProgress(0)
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    console.log('Value cleared, component reset for next upload')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }


  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {Icon && (
            React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon 
                className="h-4 w-4" 
                style={{ color: iconColor }} 
              />
            )
          )}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      {/* Main Upload Area */}
      {!value ? (
        <div className="space-y-2">
          {/* Upload Button */}
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            disabled={isUploading}
            className="h-9 w-full py-1 px-3 border-teal-200 hover:border-teal-400 text-teal-700 hover:bg-teal-50 justify-start text-base md:text-sm"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {acceptPDF ? 'File' : 'Image'}
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isUploading && (
            <Progress value={uploadProgress} className="w-full h-2" />
          )}


          {/* Helper Text */}
          <div className="text-xs text-gray-500">
            {acceptPDF ? 'Images or PDF' : 'Images only'} • Max {Math.round((settings?.maxSize || 5 * 1024 * 1024) / (1024 * 1024))}MB
          </div>
        </div>
      ) : (
        /* Uploaded File Display */
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 min-w-0">
            {acceptPDF && value.includes('.pdf') ? (
              <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <Image className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-800 truncate">
                {getFileName(value)}
              </p>
              <p className="text-xs text-green-600">
                Uploaded successfully
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            
            {/* Replace button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openFileDialog}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              <Replace className="h-4 w-4" />
            </Button>
            
            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearValue}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full"></div>
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}